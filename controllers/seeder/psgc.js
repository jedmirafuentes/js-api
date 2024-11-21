import exceljs from 'exceljs';
import regionModel from '../../models/libraries/region.js';
import provinceModel from '../../models/libraries/province.js';
import cityModel from '../../models/libraries/cityMunicipality.js';
import barangayModel from '../../models/libraries/barangay.js';
import psgcVersionModel from '../../models/psgcVersion.js';
import mongo from '../../config/db.js';

function convertToArray(worksheet, header, headerIndex) {
    const psgcList = [];
    worksheet.eachRow((row, rowPosition) => {
        if (rowPosition === 1) return;

        const rowData = {};

        header.forEach((colHeader, colNumber) => {
            rowData[colHeader] = [0, null, undefined, ""].includes(row.getCell(headerIndex[colNumber]).value) ? 
                                    row.getCell(headerIndex[colNumber]).value :
                                    row.getCell(headerIndex[colNumber]).value.toString();
        });
        if (!rowData[header[3]]) return;
        psgcList.push(rowData);
    });

    return psgcList;
};

function disseminate(psgcList, header) {
    let regionData = [];
    let provinceData = [];
    let cityMunicipalityData = [];
    let barangayData = [];
    let last_occurred_city = {};
    const destruct = (code, zeroCount) => {
        return `${code.slice(0, -zeroCount)}${'0'.repeat(zeroCount)}`;
    };
    const lookUp = (code) => {
        return psgcList.find(rowPos => rowPos[header[0]] === code);
    };

    psgcList.forEach((data) => {
        if (!data[header[3]]) return;

        let testProvObj = lookUp(destruct(data[header[0]], 5));
        let testCityMunObj = lookUp(destruct(data[header[0]], 3));
        let objData = {
            tenDigitCode: data[header[0]],
            nineDigitCode: data[header[2]],
        };

        if (data[header[3]] === "Reg") {
            objData.region = data[header[1]];
            regionData.push(objData);
        } else if (data[header[3]] === "Prov") {
            objData.region = destruct(data[header[0]], 8);
            objData.province = data[header[1]];
            provinceData.push(objData);
        } else if (data[header[3]] === "City" || data[header[3]] === "Mun" || data[header[3]] === "SubMun") {
            if (data[header[3]] === "SubMun") {
                let cityOrigin = lookUp(destruct(data[header[0]], 5)); // assuming the city is 5digit and 5digit zeros
                
                if (Object.keys(last_occurred_city).length === 0) {
                    last_occurred_city = cityOrigin;
                    console.log("last_occurred_city: ", last_occurred_city);

                    let cityIndex = cityMunicipalityData.findIndex(element => element.tenDigitCode === last_occurred_city[header[0]]);

                    cityMunicipalityData.splice(cityIndex, 1);
                } else if (cityOrigin[header[1]] !== last_occurred_city[header[1]]) {
                    last_occurred_city = cityOrigin;
                    console.log("last_occurred_city: ", last_occurred_city);

                    let cityIndex = cityMunicipalityData.findIndex(element => element.tenDigitCode === last_occurred_city[header[0]]);
                    
                    cityMunicipalityData.splice(cityIndex, 1);
                }
                objData.region = destruct(data[header[0]], 8);
                objData.province = "";
                objData.cityMunicipality = `${last_occurred_city[header[1]]} - ${data[header[1]]}`
                objData.cityClass = last_occurred_city[header[4]];
                cityMunicipalityData.push(objData);
            } else {
                objData.region = destruct(data[header[0]], 8);
                objData.cityMunicipality = data[header[1]];
                objData.cityClass = data[header[4]];
                if (testProvObj) 
                    if (testProvObj[header[3]] === "Prov") objData.province = destruct(data[header[0]], 5);
                    else objData.province = "";
                else objData.province = "";
                cityMunicipalityData.push(objData);
            }
        } 
        else if (data[header[3]] === "Bgy") {
            objData.region = destruct(data[header[0]], 8);
            objData.barangay = data[header[1]];
            objData.province = testCityMunObj[header[4]] === "HUC" ? "" : destruct(data[header[0]], 5); // if HUC, no Province as default
            objData.cityMunicipality = destruct(data[header[0]], 3);
            barangayData.push(objData);
        }; // catch those are not fell in the Geo Level list
    });

    return { regionData, provinceData, cityMunicipalityData, barangayData };
};

async function populate(collection, library) {
    try {
        await collection.insertMany(library);
        console.log(`Done creating ${collection.collection.name}`);

        return;
    } catch (error) {
        console.error(error);
    }
};

export const seed = async (req, res) => {
    if (!req.file)
        return res.status(400).send('No File Selected.');
    if (!req.body.version)
        return res.status(400).send('Version is required.')

    try {
        let version = req.body.version;
        let filename = req.file.originalname;
        const workbook = new exceljs.Workbook();
        const versionFound = await psgcVersionModel.countDocuments({ version });
        
        if (versionFound > 0) return res.status(400).send('Conflict PSGC version.')
        await workbook.xlsx.load(req.file.buffer);

        const worksheet = workbook.getWorksheet('PSGC');

        if (worksheet == undefined)
            return res.status(400).send('Missing required worksheet in excel file.');

        const header = ["10-digit PSGC", "Name", "Correspondence Code", "Geographic Level", "City Class"];
        const firstRow = worksheet.getRow(1);
        const fileHeader = firstRow.values;
        const headerIndex = header.map((element) => fileHeader.indexOf(element));
        const isHeaderPassed = () => {
            return header.every((thisHeader) => {
                return fileHeader.includes(thisHeader)
            })
        };

        if (!isHeaderPassed())
            return res.status(400).send("Invalid file content.");

        console.log("Processing the file...");

        const psgcList = convertToArray(worksheet, header, headerIndex);

        console.log("Done processing the file");
        console.log("Disseminating data...");

        const psgcObj = disseminate(psgcList, header);

        console.log("Done Disseminating data");
        console.log("Creating collections...");

        let regionCollection = regionModel(`${version}_regions`);
        let provinceCollection = provinceModel(`${version}_provinces`);
        let munCityCollection = cityModel(`${version}_MunCities`);
        let bgyCollection = barangayModel(`${version}_barangays`);
        let newVersionPSGC = new psgcVersionModel({ fileName: filename, version });

        await populate(regionCollection, psgcObj.regionData);
        await populate(provinceCollection, psgcObj.provinceData);
        await populate(munCityCollection, psgcObj.cityMunicipalityData);
        await populate(bgyCollection, psgcObj.barangayData);
        await newVersionPSGC.save();
        console.log("Done creation of collections");

        return res.status(200).json({response: "ok"});
        
    } catch (err) {
        console.log(err)
        res.json({err: `${err}`})
    }
};

export const retrieve = async (req, res) => {
    let version = req.query.version ? { version: req.query.version } : {};

    try {
        let response = await psgcVersionModel.find(version);

        res.status(200).json({ response });
    } catch (error) {
        res.status(400).json({ error });
    }
};

export const drop = async (req, res) => {
    let version;
    let postfixNames = ["_regions", "_provinces", "_MunCities", "_SubMunicipalities", "_barangays"];
    let collectionsToBeDropped = [];

    try {
        if (req.query.version) version = req.query.version;
        else throw new Error("Version is required.");

        await psgcVersionModel.find({ version, isActive: true }).then(result => {
            if (result.length === 0) throw new Error("Version not found.");
        });

        postfixNames.forEach(name => collectionsToBeDropped.push(`${version}${name}`));

        for (const name of collectionsToBeDropped) {
            const collectionName = mongo.mongoose.connection.db.collection(name);

            if (collectionName) {
                try {
                    await collectionName.drop(); 
                    console.log(`Dropped collection: ${name}`);
                } catch (error) {
                    if (error.message === 'ns not found') {
                        console.log(`Collection ${name} doesn't exist!`);
                    } else {
                        console.error(`Error dropping collection ${name}:`, error);
                    }
                }
            } else {
                throw new Error(`Collection ${name} not found in the database.`);
            }
        };

        await psgcVersionModel.updateOne({ version }, { $set: { isActive: false } })
            .then(() => res.status(200).json({response: "ok"}))
            .catch((error) => {
                console.log(error);
                throw new Error("Failed to drop collections.");
            });
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: `${error}` });
    }
};