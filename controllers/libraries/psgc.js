import regionModel from '../../models/libraries/region.js';
import provinceModel from '../../models/libraries/province.js';
import cityModel from '../../models/libraries/cityMunicipality.js';
import barangayModel from '../../models/libraries/barangay.js';
import subMunicipalityModel from '../../models/libraries/subMunicipality.js';

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

    try {
        let result = await regionCollection.find({});
        let data = [];

        for (const doc of result) {
            let provCount = await peekCount(provinceCollection, { region: doc.tenDigitCode });

            data.push({
                region: doc.region,
                code: doc.tenDigitCode,
                haveProvince: provCount > 0 ? true : false
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

        if (provCount <= 0) return res.status(400).json({ message: "Invalid regionCode.", data });

        let result = await provinceCollection.find({ region: regionCode });

        for (const doc of result) {
            data.push({
                province: doc.province,
                code: doc.tenDigitCode,
            })
        };

        res.status(200).json({ message: "ok", data });
    } catch (error) {
        res.status(400).json({ error: `${error}`});
    }
}; 

export const fetchMunCities = async (req, res) => {
    if (!req.query.regionCode) return res.status(400).json({ message: "regionCode is required."});

    let regionCode = req.query.regionCode;
    let version = req.query.version;
    let munCityCollection = cityModel(`${version}_MunCities`);
    let subMunCollection = subMunicipalityModel(`${version}_SubMunicipalities`);

    try {
        let countByRegion = await peekCount(munCityCollection, { region: regionCode });
        let data = [];
        let result;

        if (countByRegion <= 0) return res.status(400).json({ message: "Invalid regionCode.", data });
        if (regionCode === "1300000000") {
            if (req.query.provinceCode) return res.status(400).json({ message: "regionCode matched with NCR Region. Province is not required."});
            result = await munCityCollection.find({ region: regionCode });
            for (const doc of result) {
                let subMunCount = await peekCount(subMunCollection, { region: doc.region, cityMunicipality: doc.tenDigitCode });
                data.push({
                    cityMunicipality: doc.cityMunicipality,
                    code: doc.tenDigitCode,
                    haveSubMun: subMunCount > 0 ? true : false
                });
            };
        } else {
            if (!req.query.provinceCode) return res.status(400).json({ message: "provinceCode is required."});

            let provinceCode = req.query.provinceCode;
            let countByProv = await peekCount(munCityCollection, { province: provinceCode });

            if (countByProv <= 0) return res.status(400).json({ message: "Invalid provinceCode.", data });

            result = await munCityCollection.find({ region: regionCode, province: provinceCode });

            if (result.length <= 0) return res.status(400).json({ message: "Invalid regionCode or provinceCode", data});
            for (const doc of result) {
                data.push({
                    cityMunicipality: doc.cityMunicipality,
                    code: doc.tenDigitCode,
                    haveSubMun: false
                });
            };
        }

        res.status(200).json({ message: "ok", data });
    } catch (error) {
        res.status(400).json({ error: `${error}`});
    }
}; 

export const fetchSubMunicipalities = async (req, res) => {
    if (!req.query.regionCode) return res.status(400).json({ message: "regionCode is required." });
    if (!req.query.munCityCode) return res.status(400).json({ message: "munCityCode is required." });

    let { regionCode, munCityCode } = req.query;
    let version = req.query.version;
    let subMunCollection = subMunicipalityModel(`${version}_SubMunicipalities`);

    try {
        let countByRegion = await peekCount(subMunCollection, { region: regionCode });
        let countByMunCity = await peekCount(subMunCollection, { cityMunicipality: munCityCode });
        let data = [];

        if (countByRegion <= 0) return res.status(400).json({ message: "Invalid regionCode.", data });
        if (countByMunCity <= 0) return res.status(400).json({ message: "Invalid munCityCode.", data });

        let result = await subMunCollection.find({ region: regionCode, cityMunicipality: munCityCode });

        if (result.length <= 0) return res.status(400).json({ message: "Invalid regionCode or munCityCode.", data });
        for (const doc of result) {
            data.push({
                subMunicipality: doc.subMunicipality,
                code: doc.tenDigitCode
            });
        };

        res.status(200).json({ message: "ok", data });
    } catch (error) {
        res.status(400).json({ error: `${error}`});
    }
}; 

export const fetchBarangays = async (req, res) => {
    if (!req.query.regionCode) return res.status(400).json({ message: "regionCode is required." });
    if (!req.query.munCityCode) return res.status(400).json({ message: "munCityCode is required." });

    let { regionCode, munCityCode } = req.query;
    let version = req.query.version;
    let bgyCollection = barangayModel(`${version}_barangays`);

    try {
        let provinceCode = "";
        let subMunCode = "";
        let result;
        let data;

        if (regionCode === '1300000000') {
            if (req.query.provinceCode) return res.status(400).json({ message: "regionCode matched with NCR Region. Province is not required."});

            let countByMunCity = await peekCount(bgyCollection, { region: regionCode, cityMunicipality: munCityCode });

            if (countByMunCity <= 0) return res.status(400).json({ message: "Invalid munCityCode." });
            // if its okay even if only the regionCode and munCityCode is in the query
            result = await bgyCollection.find({ region: regionCode, cityMunicipality: munCityCode, subMunicipality: "" });
            if (result.length <= 0) {
                // if it requires subMunCode
                if (!req.query.subMunCode) return res.status(400).json({ message: "subMunCode is required."});
                subMunCode = req.query.subMunCode;
                result = await bgyCollection.find({ region: regionCode, cityMunicipality: munCityCode, subMunicipality: subMunCode });

                if (result.length <= 0) 
                    return res.status(400).json({ message: "Invalid regionCode, munCityCode or subMunCode."});
                else
                    data = result;
            } else 
                data = result;
        } else {
            if (!req.query.provinceCode) return res.status(400).json({ message: "provinceCode is required."});
            if (req.query.subMunCode) return res.status(400).json({ message: "subMunCode is not required." });
            provinceCode = req.query.provinceCode;
            result = await bgyCollection.find({ region: regionCode, province: provinceCode, cityMunicipality: munCityCode });
            if (result.length <= 0)
                return res.status(400).json({ message: "Invalid regionCode, provinceCode, or munCityCode."});
            else
                data = result;
        }
        res.status(200).json({ message: "ok", data });
    } catch (error) {
        res.status(400).json({ error: `${error}`});
    }
}; 