import exceljs from 'exceljs';
import regionModel from '../../models/libraries/region.js';
import provinceModel from '../../models/libraries/province.js';
import cityModel from '../../models/libraries/cityMunicipality.js';
import barangayModel from '../../models/libraries/barangay.js';
import subMunicipalityModel from '../../models/libraries/subMunicipality.js';
import psgcVersionModel from '../../models/psgcVersion.js';
import mongo from '../../config/db.js';

function convertToArray(worksheet, header) {
    const psgcList = [];

    worksheet.eachRow((row, rowPosition) => {
        if (rowPosition === 1) return;

        const rowData = {};

        header.forEach((colHeader, colNumber) => {
            rowData[colHeader] = [0, null, undefined, ""].includes(row.getCell(colNumber + 1).value) ? 
                                    row.getCell(colNumber + 1).value:
                                    row.getCell(colNumber + 1).value.toString();
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
    let subMunicipalitiesData = [];
    let barangayData = [];
    const destruct = (code, zeroCount) => {
        return `${code.slice(0, -zeroCount)}${'0'.repeat(zeroCount)}`;
    };
    const lookUp = (code) => {
        return psgcList.find(rowPos => rowPos[header[0]] === code);
    };

    psgcList.forEach((data) => {
        if (!data[header[3]]) return;

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
        } else if (data[header[3]] === "City" || data[header[3]] === "Mun") {
            objData.region = destruct(data[header[0]], 8);
            objData.province = destruct(data[header[0]], 5);
            objData.cityMunicipality = data[header[1]];
            cityMunicipalityData.push(objData);
        } else if (data[header[3]] === "SubMun") {
            objData.region = destruct(data[header[0]], 8);
            objData.cityMunicipality = destruct(data[header[0]], 5);
            objData.subMunicipality = data[header[1]];
            subMunicipalitiesData.push(objData);
        } else if (data[header[3]] === "Bgy") {
            let testProvObj = lookUp(destruct(data[header[0]], 5));
            let testCityMunObj = lookUp(destruct(data[header[0]], 3));
            
            objData.region = destruct(data[header[0]], 8);
            objData.barangay = data[header[1]];
            // if test Prov is not prov
            if (testProvObj) { // if there are no look ups from the 5th digit code
                if (testProvObj[header[3]] === "Prov") {
                    objData.province = destruct(data[header[0]], 5);
                    if (testCityMunObj[header[3]] === "City" || testCityMunObj[header[3]] === "Mun")
                        objData.cityMunicipality = destruct(data[header[0]], 3);
                    if (testCityMunObj[header[3]] === "SubMun") 
                        console.log("SubMun: ", data)// test conditions, musn't fall in this block
                } else if (testProvObj[header[3]] === "City") { // acting as Prov, exists in 5 digit
                    objData.province = "";
                    objData.cityMunicipality = destruct(data[header[0]], 5);
                    if (testCityMunObj[header[3]] === "SubMun")
                        objData.subMunicipality = destruct(data[header[0]], 3); 
                }  
            } else if (testCityMunObj[header[3]] === "Mun") { // expecting that the code is unique
                objData.cityMunicipality = destruct(data[header[0]], 3);
            }
            barangayData.push(objData);
        }; // catch those are not fell in the Geo Level list
    });

    return { regionData, provinceData, cityMunicipalityData, subMunicipalitiesData, barangayData };
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

        const header = ["10-digit PSGC", "Name", "Correspondence Code", "Geographic Level"];
        const firstRow = worksheet.getRow(1);
        const fileHeader = firstRow.values;
        const isHeaderPassed = () => {
            return header.every((thisHeader) => {
                return fileHeader.includes(thisHeader)
            })
        };

        if (!isHeaderPassed())
            return res.status(400).send("Invalid file content.");

        console.log("Processing the file...");

        const psgcList = convertToArray(worksheet, header);

        console.log("Done processing the file");
        console.log("Disseminating data...");

        const psgcObj = disseminate(psgcList, header);

        console.log("Done Disseminating data");
        console.log("Creating collections...");

        let regionCollection = regionModel(`${version}_regions`);
        let provinceCollection = provinceModel(`${version}_provinces`);
        let munCityCollection = cityModel(`${version}_MunCities`);
        let subMunCollection = subMunicipalityModel(`${version}_SubMunicipalities`);
        let bgyCollection = barangayModel(`${version}_barangays`);
        let newVersionPSGC = new psgcVersionModel({ fileName: filename, version });

        await populate(regionCollection, psgcObj.regionData);
        await populate(provinceCollection, psgcObj.provinceData);
        await populate(munCityCollection, psgcObj.cityMunicipalityData);
        await populate(subMunCollection, psgcObj.subMunicipalitiesData);
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