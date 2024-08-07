const { WoodProcess, ElectricProcess, Results, HumanProcess, User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailer = require('../helper/mailer');
const woodprocess = require('../models/woodprocess');
const { createResultValidator } = require('../requests/resultValidator');
const electricprocess = require('../models/electricprocess');

exports.store = async (req, res) => {
    try {
        console.log("tes tes tes");
        const activeWoodProcess = await WoodProcess.findOne({ where: { is_active: true, user_id: req.user.id } });
        const activeElectricProcess = await ElectricProcess.findAll({ where: { user_id: req.user.id } });
        console.log(activeElectricProcess)
        const currentHumanProcess = await HumanProcess.findAll({ raw: true, where: { user_id: req.user.id } });
        const { production_capacity, raw_materials } = req.body;
        const eSo2electric = 1
        const eNoxElectric = 8.5500
        const eCo2Electric = 0.7744
        const eSo2Wood = 0.181
        const eNoxWood = 1.179
        const eCo2Wood = 0.112

        const v = createResultValidator({ production_capacity })

        if (v !== true) {
            return res.status(422).json({ success: true, message: 'failed input electric process', error: v });
        };

        // let kwh = 0;
        // let mj = 0;
        // let kwhPerProd = 0;
        // let mjPerProd = 0;
        electricsResult = [];
        const energiEkuivalen = 3.6;
        objElectricToStore = [];
        activeElectricProcess.forEach(element => {
            var kwh = element.total_tools * element.watt_number * element.working_time;
            var mj = energiEkuivalen * element.total_tools * element.watt_number * element.working_time;
            var kwhPerProd = kwh / production_capacity;
            var mjPerProd = mj / production_capacity;
            electricsResult.push({ kwh: kwh, mj: mj, mjPerProd: mjPerProd, kwhPerProd: kwhPerProd })
            objElectricToStore.push({ ...element.dataValues, ...{ kwh: kwh, mj: mj, mjPerProd: mjPerProd, kwhPerProd: kwhPerProd } })


        })
        console.log('tesss', objElectricToStore)

        let sums = electricsResult.reduce((acc, curr) => {
            acc.kwh += curr.kwh;
            acc.mj += curr.mj;
            acc.mjPerProd += curr.mjPerProd;
            acc.kwhPerProd += curr.kwhPerProd;
            return acc;
        }, { kwh: 0, mj: 0, mjPerProd: 0, kwhPerProd: 0 });


        currentHumanProcess.forEach(element => {
            let jumlahenergi = (parseFloat(element.male_resource) + (0.8 * parseFloat(element.female_resource))) * parseFloat(element.working_time) * 0.79;
            let perkg = jumlahenergi / production_capacity
            element.result = { human_energy: jumlahenergi, human_energy_each_production: perkg }
        });


        var kwh = sums.kwh;
        var mj = sums.kwh;
        var kwhPerProd = kwh / production_capacity;
        var mjPerProd = mj / production_capacity;

        const energiEkuivalenKayu = 0.1978
        var mj = activeWoodProcess.total_woods * energiEkuivalenKayu;
        var mjPerProd = mj / production_capacity;
        activeWoodProcess.dataValues.result = { mj: mj, mjPerProd: mjPerProd }
        console.log('active wood process', activeWoodProcess)
        //emission electric
        console.log('kwh', kwh)
        var eSo2ElectricResultInaDay = kwh * eSo2electric
        var noxElectricResultInaDay = kwh * eNoxElectric
        var co2ElectricResultInaDay = kwh * eCo2Electric

        var eSo2ElectricResultInaDayOnKg = (eSo2ElectricResultInaDay) / 1000
        var noxElectricResultInaDayOnKg = (noxElectricResultInaDay) / 1000
        var co2ElectricResultInaDayOnKg = (co2ElectricResultInaDay)
        console.log('result', [eSo2ElectricResultInaDayOnKg, noxElectricResultInaDayOnKg, co2ElectricResultInaDayOnKg])
        var eSo2ElectricResultInaDayPerProduction = eSo2ElectricResultInaDayOnKg / production_capacity
        var noxElectricResultInaDayPerProduction = noxElectricResultInaDayOnKg / production_capacity
        var co2ElectricResultInaDayPerProduction = co2ElectricResultInaDayOnKg / production_capacity

        var eSo2ElectricResultInaDayPerProductionOnGram = eSo2ElectricResultInaDayPerProduction * 1000;
        var noxElectricResultInaDayPerProductionOnGram = noxElectricResultInaDayPerProduction * 1000;
        var co2ElectricResultInaDayPerProductionOnGram = co2ElectricResultInaDayPerProduction * 1000;

        //emission wood
        var eSo2WoodResultInaDay = eSo2Wood * activeWoodProcess.total_woods;
        var noxWoodResultInaDay = eNoxWood * activeWoodProcess.total_woods;
        console.log("check", [eCo2Wood, activeWoodProcess])
        var co2WoodResultInaDay = eCo2Wood * activeWoodProcess.dataValues.result.mj / 1000;

        var eSo2WoodResultInaDayOnKg = eSo2WoodResultInaDay / 1000;
        var noxWoodResultInaDayOnKg = noxWoodResultInaDay / 1000;
        var co2WoodResultInaDayOnKg = co2WoodResultInaDay * 1000;

        var eSo2WoodResultInaDayPerProduction = eSo2WoodResultInaDayOnKg / production_capacity;
        var noxWoodResultInaDayPerProduction = noxWoodResultInaDayOnKg / production_capacity;
        var co2WoodResultInaDayPerProduction = co2WoodResultInaDayOnKg / production_capacity;

        var eSo2WoodResultInaDayPerProductionOnGram = eSo2WoodResultInaDayPerProduction * 1000;
        var noxWoodResultInaDayPerProductionOnGram = noxWoodResultInaDayPerProduction * 1000;
        var co2WoodResultInaDayPerProductionOnGram = co2WoodResultInaDayPerProduction * 1000;

        // Create a JavaScript object for wood emissions
        var emissionWoodResults = {
            "eSo2WoodResultInaDay": eSo2WoodResultInaDay,
            "noxWoodResultInaDay": noxWoodResultInaDay,
            "co2WoodResultInaDay": co2WoodResultInaDay,
            "eSo2WoodResultInaDayOnKg": eSo2WoodResultInaDayOnKg,
            "noxWoodResultInaDayOnKg": noxWoodResultInaDayOnKg,
            "co2WoodResultInaDayOnKg": co2WoodResultInaDayOnKg,
            "eSo2WoodResultInaDayPerProduction": eSo2WoodResultInaDayPerProduction,
            "noxWoodResultInaDayPerProduction": noxWoodResultInaDayPerProduction,
            "co2WoodResultInaDayPerProduction": co2WoodResultInaDayPerProduction,
            "eSo2WoodResultInaDayPerProductionOnGram": eSo2WoodResultInaDayPerProductionOnGram,
            "noxWoodResultInaDayPerProductionOnGram": noxWoodResultInaDayPerProductionOnGram,
            "co2WoodResultInaDayPerProductionOnGram": co2WoodResultInaDayPerProductionOnGram
        };


        var emissionElectricResults = {
            "eSo2ElectricResultInaDay": eSo2ElectricResultInaDay,
            "noxElectricResultInaDay": noxElectricResultInaDay,
            "co2ElectricResultInaDay": co2ElectricResultInaDay,
            "eSo2ElectricResultInaDayOnKg": eSo2ElectricResultInaDayOnKg,
            "noxElectricResultInaDayOnKg": noxElectricResultInaDayOnKg,
            "co2ElectricResultInaDayOnKg": co2ElectricResultInaDayOnKg,
            "eSo2ElectricResultInaDayPerProduction": eSo2ElectricResultInaDayPerProduction,
            "noxElectricResultInaDayPerProduction": noxElectricResultInaDayPerProduction,
            "co2ElectricResultInaDayPerProduction": co2ElectricResultInaDayPerProduction,
            "eSo2ElectricResultInaDayPerProductionOnGram": eSo2ElectricResultInaDayPerProductionOnGram,
            "noxElectricResultInaDayPerProductionOnGram": noxElectricResultInaDayPerProductionOnGram,
            "co2ElectricResultInaDayPerProductionOnGram": co2ElectricResultInaDayPerProductionOnGram
        };



        const result = {
            activeWoodProcess: JSON.stringify(activeWoodProcess),
            activeElectricProcess: JSON.stringify(objElectricToStore),
            human_process: JSON.stringify(currentHumanProcess),
            electric_emissions: JSON.stringify({ emissionElectricResults }),
            wood_emissions: JSON.stringify({ emissionWoodResults })
        };



        const newWoodProcess = await Results.create({
            date: new Date(),
            production_capacity: production_capacity,
            human_process_settings: result.human_process,
            wood_process_settings: result.activeWoodProcess,
            electric_process_settings: result.activeElectricProcess,
            wood_emissions: result.wood_emissions,
            electric_emissions: result.electric_emissions,
            solid_emission: production_capacity * 1.1,
            liquid_emission: production_capacity * 43.4,
            user_id: req.user.id,
            raw_materials: raw_materials
        });

        return res.status(200).json({ success: true, message: 'Create wood process settings', data: newWoodProcess });
    } catch (err) {
        console.error('Error in store route:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch wood process', data: err });
    }
};


// exports.update = async (req, res) =>{
//     try {
//         const id = req.params.id;
//         const {total_woods, is_active} = req.body;
//         const user_id = {user_id : req.user.id}
//         const woodProcess = await WoodProcess.findByPk(id);

//         if (!woodProcess) {
//         return res.status(404).json({ success: false, message: 'Wood Process not found' });
//         }

//         await woodProcess.update(
//             {total_woods, is_active, user_id}
//         );

//         return res.status(200).json({ success: true, message: 'Wood Process updated successfully', data: woodProcess });
//     } catch (error) {
//         return res.status(500).json({ success: false, message: 'Error updating Wood Process', error: error.message });
//     }
// }

exports.show = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Results.findByPk(id);

        if (!result) {
            return res.status(404).json({ success: false, message: 'Wood Process not found' });
        }
        result.human_process_settings = JSON.parse(result.human_process_settings);
        result.electric_process_settings = JSON.parse(result.electric_process_settings);
        result.wood_process_settings = JSON.parse(result.wood_process_settings);
        let emissionWoodResults = JSON.parse(result.wood_emissions).emissionWoodResults;
        let emissionElectricResults = JSON.parse(result.electric_emissions).emissionElectricResults;

        const gwp = [{
            name: 'GWP Kayu',
            result: ((emissionWoodResults.co2WoodResultInaDayOnKg * 312) / 1000).toFixed(4),
        },
        {
            name: 'GWP Listrik',
            result: ((emissionElectricResults.co2ElectricResultInaDayOnKg * 312) / 1000).toFixed(4),
        },
        {
            name: 'Total',
            result: (((emissionWoodResults.co2WoodResultInaDayOnKg * 312) / 1000) +
                ((emissionElectricResults.co2ElectricResultInaDayOnKg * 312) / 1000)).toFixed(4)
        }]

        const ap = [
            {
                name: 'AP Kayu', result: ((parseFloat(emissionWoodResults.eSo2WoodResultInaDayOnKg) +
                    parseFloat(emissionWoodResults.noxWoodResultInaDayOnKg * 0.7)) * 312 / 1000).toFixed(4)
            },

            {
                name: 'AP Listrik', result: ((parseFloat(emissionElectricResults.eSo2ElectricResultInaDayOnKg) +
                    parseFloat(emissionElectricResults.noxElectricResultInaDayOnKg * 0.7)) * 312 / 1000).toFixed(4)
            },

            {
                name: 'Total', result: (((parseFloat(emissionWoodResults.eSo2WoodResultInaDayOnKg) +
                    parseFloat(emissionWoodResults.noxWoodResultInaDayOnKg * 0.7)) * 312 / 1000) +
                    (parseFloat(emissionElectricResults.eSo2ElectricResultInaDayOnKg) +
                        parseFloat(emissionElectricResults.noxElectricResultInaDayOnKg * 0.7)) * 312 / 1000).toFixed(4)
            }]
        
        const listrikAp =
        [
            {name:"so2", result:emissionElectricResults.eSo2ElectricResultInaDayOnKg.toFixed(4)},
            {name:"nox", result:(emissionElectricResults.noxElectricResultInaDayOnKg * 0.7).toFixed(4)},
            {name: "total AP listrik", result:(parseFloat(emissionElectricResults.eSo2ElectricResultInaDayOnKg) +
                parseFloat(emissionElectricResults.noxElectricResultInaDayOnKg * 0.7)).toFixed(4)},

        ]
        const listrikGwp = [

            {name:'CO2', result:emissionElectricResults.co2ElectricResultInaDayOnKg.toFixed(4)},
            {name:'total', result:emissionElectricResults.co2ElectricResultInaDayOnKg.toFixed(4)},
            {name:'', result:''}
        ]
        const kayuGwp = [
            {name: 'CO2', result:emissionWoodResults.co2WoodResultInaDayOnKg.toFixed(4)},
            {name: 'total', result:emissionWoodResults.co2WoodResultInaDayOnKg.toFixed(4)},
            {name:'', result:''}
        ]
        const kayuAp = [
            {name: "so2", result:emissionWoodResults.eSo2WoodResultInaDayOnKg.toFixed(4)},
            {name: "nox",result:(emissionWoodResults.noxWoodResultInaDayOnKg * 0.7).toFixed(4)},
            {name: "total", result:(parseFloat(emissionWoodResults.eSo2WoodResultInaDayOnKg) +
                parseFloat(emissionWoodResults.noxWoodResultInaDayOnKg * 0.7)).toFixed(4)},

        ]
        return res.status(200).json({ success: true, message: 'Wood Process updated successfully', data: result, gwp: gwp, ap: ap, listrikAp: listrikAp, listrikGwp: listrikGwp, kayuGwp:kayuGwp, kayuAp: kayuAp });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Error updating Wood Process', error: error.message });
    }
}

exports.index = async (req, res) => {
    try {
        const { page = 1, pageSize = 5 } = req.query;
        const offset = (page - 1) * pageSize;

        const results = await Results.findAndCountAll({
            limit: +pageSize,
            offset,
            where: { user_id: req.user.id },
            order: [
                ['createdAt', 'DESC']
            ]

        });

        return res.status(200).json({
            success: true,
            message: 'Posts retrieved successfully',
            data: results.rows,
            totalItems: results.count,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error retrieving wood process', error: error });
    }
}

exports.destroy = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Results.findByPk(id)
        if (!result) {
            return res.status(404).json({ success: false, message: 'result not found' });
        }
        await result.destroy();
        return res.status(200).json({
            success: true,
            message: 'result deleted',
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error retrieving wood process', error: error.message });

    }
}

exports.set = async (req, res) => {
    try {
        const woodProcess = await WoodProcess.findByPk(req.params.id)
        if (!woodProcess) {
            return res.status(404).json({ success: false, message: "wood process not found" });
        }

        await woodProcess.update({ is_active: !woodProcess.is_active })
        return res.status(200).json({
            success: true,
            message: 'wood process updated',
            data: woodProcess
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "error updating wood process", error: error.message })
    }
}

exports.getActive = async (req, res) => {
    try {
        const woodProcess = await WoodProcess.findOne({ where: { user_id: 1, is_active: true } });
        if (!woodProcess) {
            return res.status(404).json({
                success: true,
                message: 'active wood not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: "get active wood process",
            data: woodProcess
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "error getting wood process", error: error.message })
    }
}

exports.downloadResult = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Results.findByPk(id);
        const user = await User.findByPk(result.user_id);
        console.log('user', user)
        if (!result) {
            return res.status(404).json({ success: false, message: 'Wood Process not found' });
        }
        console.log('tes', result.dataValues.solid_emission)

        let human_process_settings = JSON.parse(result.human_process_settings);
        let electric_process_settings = JSON.parse(result.electric_process_settings);
        let wood_process_settings = JSON.parse(result.wood_process_settings);
        human_process_settings = human_process_settings.map(item => ([item.process_name, item.male_resource, item.female_resource, item.working_time, item?.result?.human_energy?.toFixed(4), item?.result?.human_energy_each_production.toFixed(4)]))
        console.log('electric proses settings', electric_process_settings);
        electric_process_settings = electric_process_settings.map(item => ([item.process_name, item.tools_name, item.kwh.toFixed(4), item.mj.toFixed(4), item.mjPerProd.toFixed(4), item.kwhPerProd.toFixed(4)]))

        let emissionElectricResults = JSON.parse(result.electric_emissions).emissionElectricResults;
        let emissionWoodResults = JSON.parse(result.wood_emissions).emissionWoodResults;

        const fs = require('fs');
        const PDFDocument = require('pdfkit-table');
        let doc = new PDFDocument({ margin: 30, size: 'A4' });
        let buffers = [];

        doc.on('error', (error) => {
            console.error('Error during PDF generation:', error);
            res.status(500).json({ success: false, message: 'Error generating PDF' });
        });

        doc.on('data', buffers.push.bind(buffers));

        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            res.writeHead(200, {
                'Content-Length': Buffer.byteLength(pdfData),
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment;filename=test.pdf',
            });
            res.end(pdfData);
        });

        // Skip writing to disk if not needed
        // doc.pipe(fs.createWriteStream('./document.pdf'));
        //  TGL ${result.createdAt.toISOString().split('T')[0]} 
        //console.log(req.user)

        const tableHead = {
            title: `Laporan Penghitungan LCA Industri Tahu`,
            headers: ['', '',],
            rows: [
                ['Nama', user.username],
                ['Tanggal', result.createdAt.toISOString().split('T')[0]],
                ['Jumlah Bahan Baku', result.production_capacity + "kg" || 0],
                ['Estimasi Produk Akhir', (result.production_capacity * 3.2).toFixed(4) + 'kg' || 0]

            ],
        };

        await doc.table(tableHead, {
            width: 250,
        });

        doc.moveDown();

        const table = {

            subtitle: 'Energi Manusia',
            headers: ['Nama Proses', 'Tenaga Kerja Pria', 'Tenaga Kerja Wanita', 'Waktu Kerja(jam)', 'Energi Tenaga Kerja(MJ)', 'Energi Tenaga Kerja Per kg(MJ/kg)'],
            rows: human_process_settings,
        };
        function sumColumns(rows) {
            const sums = Array(rows[0].length).fill(0);
            rows.forEach(row => {
                row.forEach((cell, index) => {
                    if (index !== 0) {
                        sums[index] += +(+cell).toFixed(4);
                    }
                });
            });
            sums[0] = 'Total';  // Set the name for the sum row
            return sums;
        }

        const sumRow = sumColumns(human_process_settings);
        table.rows.push(sumRow)

        await doc.table(table, {
            width: 500,
        });
        console.log(wood_process_settings);

        doc.moveDown();

        const table2 = {
            subtitle: 'Energi Listrik',
            headers: ['Nama Proses', 'Nama Alat', 'Konsumsi Energi (kWh)', 'Konsumsi Energi (MJ)', 'MJ/kg', 'kWh/kg'
            ],
            rows: electric_process_settings
        };

        const sumRowElectric = sumColumns(electric_process_settings);
        table2.rows.push(sumRowElectric);

        await doc.table(table2, {
            width: 300,
        });

        doc.moveDown();

        const table3 = {
            subtitle: 'Energi Kayu',
            headers: ['Nama Proses', 'Energi (MJ/Hari)', 'Energi (MJ/kg)'
            ],
            rows: [
                ['Perebusan', wood_process_settings.result.mj.toFixed(4), wood_process_settings.result.mjPerProd.toFixed(4)]
            ],
        };

        await doc.table(table3, {
            width: 300,
        });

        doc.moveDown();
        const tableElectric = {
            subtitle: 'Emisi Listrik',
            headers: [
                'Emisi',
                'SO2 Dalam Sehari (kg)',
                'NOx Dalam Sehari (kg)',
                'CO2 Dalam Sehari (kg)',
                'SO2 Per Produksi (kg)',
                'NOx Per Produksi (kg)',
                'CO2 Per Produksi (kg)'
            ],
            rows: [
                [
                    'Listrik',
                    emissionElectricResults.eSo2ElectricResultInaDayOnKg.toFixed(4),
                    emissionElectricResults.noxElectricResultInaDayOnKg.toFixed(4),
                    emissionElectricResults.co2ElectricResultInaDayOnKg.toFixed(4),
                    (emissionElectricResults.eSo2ElectricResultInaDayPerProductionOnGram / 1000).toFixed(4),
                    (emissionElectricResults.noxElectricResultInaDayPerProductionOnGram / 1000).toFixed(4),
                    (emissionElectricResults.co2ElectricResultInaDayPerProductionOnGram / 1000).toFixed(4)
                ]
            ],
        };

        await doc.table(tableElectric, {
            width: 500,
        });

        doc.moveDown();

        const tableWood = {
            subtitle: 'Emisi Kayu',
            headers: [
                'emisi',
                'SO2 Dalam Sehari (kg)',
                'NOx Dalam Sehari (kg)',
                'CO2 Dalam Sehari (kg)',
                'SO2 Per Produksi (kg)',
                'NOx Per Produksi (kg)',
                'CO2 Per Produksi (kg)'
            ],
            rows: [
                [
                    'kayu',
                    emissionWoodResults.eSo2WoodResultInaDayOnKg.toFixed(4),
                    emissionWoodResults.noxWoodResultInaDayOnKg.toFixed(4),
                    emissionWoodResults.co2WoodResultInaDayOnKg.toFixed(4),
                    (emissionWoodResults.eSo2WoodResultInaDayPerProductionOnGram / 1000).toFixed(4),
                    (emissionWoodResults.noxWoodResultInaDayPerProductionOnGram / 1000).toFixed(4),
                    (emissionWoodResults.co2WoodResultInaDayPerProductionOnGram / 1000).toFixed(4)
                ]
            ],
        };

        await doc.table(tableWood, {
            width: 500,
        });

        doc.moveDown();

        doc.addPage()
        const DampakLingkunganEmisiListrik = {
            subtitle: 'Dampak Lingkungan Emisi Listrik GWP',
            headers: [
                'CO2',
                'Total (kg/Hari)',

            ],
            rows: [
                [

                    emissionElectricResults.co2ElectricResultInaDayOnKg.toFixed(4),
                    emissionElectricResults.co2ElectricResultInaDayOnKg.toFixed(4),

                ]
            ],
        };

        await doc.table(DampakLingkunganEmisiListrik, {
            width: 500,
        });

        doc.moveDown();




        const DampakLingkunganEmisiListrikAP = {
            subtitle: 'Dampak Lingkungan Emisi Listrik AP',
            headers: [
                'SO2',
                'NOX',
                'Total (kg/Hari)',
            ],
            rows: [
                [
                    emissionElectricResults.eSo2ElectricResultInaDayOnKg.toFixed(4),
                    (emissionElectricResults.noxElectricResultInaDayOnKg * 0.7).toFixed(4),
                    (parseFloat(emissionElectricResults.eSo2ElectricResultInaDayOnKg) +
                        parseFloat(emissionElectricResults.noxElectricResultInaDayOnKg * 0.7)).toFixed(4),

                ]
            ],
        };




        //emissionWoodResults.eSo2WoodResultInaDayOnKg.toFixed(4), 
        //emissionWoodResults.noxWoodResultInaDayOnKg.toFixed(4) * 0.7
        await doc.table(DampakLingkunganEmisiListrikAP, {
            width: 500,
        });

        doc.moveDown();
        const DampakLingkunganEmisiKayu = {
            subtitle: 'Dampak Lingkungan Emisi Kayu GWP',
            headers: [
                'CO2',
                'Total (kg/Hari)',

            ],
            rows: [
                [
                    emissionWoodResults.co2WoodResultInaDayOnKg.toFixed(4),
                    emissionWoodResults.co2WoodResultInaDayOnKg.toFixed(4),
                ]
            ],
        };

        await doc.table(DampakLingkunganEmisiKayu, {
            width: 500,
        });

        doc.moveDown();
        const DampakLingkunganEmisiKayuAP = {
            subtitle: 'Dampak Lingkungan Emisi Kayu AP',
            headers: [
                'SO2',
                'NOX',
                'Total (kg/Hari)',
            ],
            rows: [
                [
                    emissionWoodResults.eSo2WoodResultInaDayOnKg.toFixed(4),
                    (emissionWoodResults.noxWoodResultInaDayOnKg * 0.7).toFixed(4),
                    (parseFloat(emissionWoodResults.eSo2WoodResultInaDayOnKg) +
                        parseFloat(emissionWoodResults.noxWoodResultInaDayOnKg * 0.7)).toFixed(4),

                ]
            ],
        };




        //emissionWoodResults.eSo2WoodResultInaDayOnKg.toFixed(4), 
        //emissionWoodResults.noxWoodResultInaDayOnKg.toFixed(4) * 0.7
        await doc.table(DampakLingkunganEmisiKayuAP, {
            width: 500,
        });

        doc.moveDown();


        const DampakLingkunganEmisiKayuTotal = {
            subtitle: 'Dampak Lingkungan GWP Per Tahun',
            headers: [
                'Nama',
                'Total(Ton/Tahun)'

            ],
            rows: [

                ['CO2',
                    ((emissionWoodResults.co2WoodResultInaDayOnKg * 312) / 1000).toFixed(4),
                ],
                ['CO2',
                    ((emissionElectricResults.co2ElectricResultInaDayOnKg * 312) / 1000).toFixed(4),
                ],
                ['Total',
                    (((emissionWoodResults.co2WoodResultInaDayOnKg * 312) / 1000) +
                        ((emissionElectricResults.co2ElectricResultInaDayOnKg * 312) / 1000)).toFixed(4)
                ]
            ]
            ,
        };
        await doc.table(DampakLingkunganEmisiKayuTotal, {
            width: 500,
        });
        doc.moveDown();

        const DampakLingkunganEmisiListrikTotal = {
            subtitle: 'Dampak Lingkungan AP Per Tahun',
            headers: [
                'Nama',
                'Total(Ton/Tahun)'

            ],
            rows: [

                ['AP Kayu', ((parseFloat(emissionWoodResults.eSo2WoodResultInaDayOnKg) +
                    parseFloat(emissionWoodResults.noxWoodResultInaDayOnKg * 0.7)) * 312 / 1000).toFixed(4)],

                ['AP Listrik', ((parseFloat(emissionElectricResults.eSo2ElectricResultInaDayOnKg) +
                    parseFloat(emissionElectricResults.noxElectricResultInaDayOnKg * 0.7)) * 312 / 1000).toFixed(4)],

                ['Total', (((parseFloat(emissionWoodResults.eSo2WoodResultInaDayOnKg) +
                    parseFloat(emissionWoodResults.noxWoodResultInaDayOnKg * 0.7)) * 312 / 1000) +
                    (parseFloat(emissionElectricResults.eSo2ElectricResultInaDayOnKg) +
                        parseFloat(emissionElectricResults.noxElectricResultInaDayOnKg * 0.7)) * 312 / 1000).toFixed(4)],

            ]
            ,
        };



        //emissionWoodResults.eSo2WoodResultInaDayOnKg.toFixed(4), 
        //emissionWoodResults.noxWoodResultInaDayOnKg.toFixed(4) * 0.7
        await doc.table(DampakLingkunganEmisiListrikTotal, {
            width: 500,
        });

        doc.moveDown();



        const tableEmission = {
            subtitle: 'Estimasi Limbah',
            headers: [
                'Limbah padat(kg)',
                'Limbah cair(liter)'
            ],
            rows: [
                [

                    result.solid_emission.toFixed(4),
                    result.liquid_emission.toFixed(4),

                ]
            ],
        };

        await doc.table(tableEmission, {
            width: 500,
        });

        doc.end();
    } catch (error) {
        console.error('Error in downloadResult:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }


}