import regionModel from '../../models/libraries/region.js';
import provinceModel from '../../models/libraries/province.js';
import cityModel from '../../models/libraries/cityMunicipality.js';
import barangayModel from '../../models/libraries/barangay.js';

const peekCount = async (model, query) => {
    try {
        let result = await model.countDocuments(query);

        return result;
    } catch (error) {
        throw new Error(`Something went wrong. Peek count. ${error}`);
    }
};

export const fetchRegions = async (req, res) => {
    let version = req.query.version; // temporary
    let regionCollection = regionModel(`${version}_regions`);
    let provinceCollection = provinceModel(`${version}_provinces`);
    let munCityCollection = cityModel(`${version}_MunCities`);

    try {
        let result = await regionCollection.find({});
        let data = [];

        for (const doc of result) {
            let provCount = await peekCount(provinceCollection, { region: doc.tenDigitCode });
            let preCountCityMun = await peekCount(munCityCollection, { region: doc.tenDigitCode, cityClass: "HUC"});

            data.push({
                region: doc.region,
                code: doc.tenDigitCode,
                provinceCount: provCount,
                hucCount: preCountCityMun
            })
        };

        res.status(200).json({ message: "ok", data });
    } catch (error) {
        res.status(400).json({ error: `${error}`});
    }
}; 

export const fetchProvinces = async (req, res) => {
    if (!req.query.regionCode) return res.status(400).json({ message: "regionCode is required."});

    let regionCode = req.query.regionCode;
    let version = req.query.version;
    let provinceCollection = provinceModel(`${version}_provinces`);

    try {
        let provCount = await peekCount(provinceCollection, { region: regionCode });
        let data = [];

        if (provCount <= 0) return res.status(200).json({ 
            success: false,
            message: "Invalid regionCode or No Province found in this region.", 
            data 
        });

        let result = await provinceCollection.find({ region: regionCode });

        for (const doc of result) {
            data.push({
                province: doc.province,
                code: doc.tenDigitCode,
            })
        };

        res.status(200).json({ success: true, message: "ok", data });
    } catch (error) {
        res.status(400).json({ error: `${error}`});
    }
}; 

export const fetchMunCities = async (req, res) => {
    if (!req.query.regionCode) return res.status(400).json({ message: "regionCode is required." });
    // if (!req.query.provinceCode) return res.status(400).json({ message: "provinceCode is required." });

    let version = req.query.version;
    let { provinceCode, regionCode } = req.query;
    let munCityCollection = cityModel(`${version}_MunCities`);

    try {
        let query = provinceCode === '""' || !provinceCode ? 
            { region: regionCode, province: "" } : 
            { region: regionCode, province: provinceCode };
            console.log(query);
        let result = await munCityCollection.find(query);
        let data = [];

        if (result.length <= 0) return res.status(200).json({ success: false, message: `No records found. Query: { regionCode: ${regionCode}, provinceCode: ${provinceCode} }` });
        for (const doc of result) {
            data.push({
                "city/municipality": doc.cityMunicipality,
                code: doc.tenDigitCode
            });
        }

        res.status(200).json({ success: true, message: "ok", data });
    } catch (error) {
        res.status(400).json({ error: `${error}`});
    }
}; 

export const fetchBarangays = async (req, res) => {
    if (!req.query.munCityCode) return res.status(400).json({ message: "munCityCode is required." });

    let { munCityCode } = req.query;
    let version = req.query.version;
    let bgyCollection = barangayModel(`${version}_barangays`);

    try {
        let result = await bgyCollection.find({ cityMunicipality: munCityCode });
        let data = [];

        if (result.length <= 0) return res.status(200).json({ message: `No result found. Query: { munCityCode: ${munCityCode} }`});
        for (const doc of result) {
            data.push({
                barangay: doc.barangay,
                code: doc.tenDigitCode
            });
        };

        res.status(200).json({ success: true, message: "ok", data });
    } catch (error) {
        res.status(400).json({ error: `${error}`});
    }
}; 