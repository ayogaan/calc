const {WoodProcess, ElectricProcess, Results, HumanProcess} = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailer = require('../helper/mailer');
const woodprocess = require('../models/woodprocess');
const { createResultValidator } = require('../requests/resultValidator');

exports.store = async (req, res) => {
    try {
        const activeWoodProcess = await WoodProcess.findOne({ where: { is_active: true, user_id: req.user.id } });
        const activeElectricProcess = await ElectricProcess.findOne({ where: { is_active: true, user_id: req.user.id } });
        const currentHumanProcess = await HumanProcess.findAll({ raw: true, where: {user_id: req.user.id} });
        const { production_capacity } = req.body;
        const eSo2electric =  1
        const eNoxElectric = 8.5500
        const eCo2Electric =  0.7744
        const eSo2Wood =  0.181
        const eNoxWood = 1.179
        const eCo2Wood =  0.112        

        const v = createResultValidator({production_capacity})
        
        if( v !== true){
            return res.status(422).json({ success: true, message: 'failed input electric process', error: v });
        };

        if (!activeWoodProcess || !activeElectricProcess) {
            return res.status(404).json({ success: false, message: 'Active processes not found' });
        }

        currentHumanProcess.forEach(element => {
            let jumlahenergi =  (parseFloat(element.male_resource) + (0.8 * parseFloat(element.female_resource))) * parseFloat(element.working_time) * 0.79; 								
            let perkg = jumlahenergi / production_capacity
            element.result = {human_energy : jumlahenergi, human_energy_each_production : perkg}
        });

        const energiEkuivalen = 3.6;
        
        var kwh = activeElectricProcess.total_tools * activeElectricProcess.watt_number * activeElectricProcess.working_time;
        var mj = energiEkuivalen * activeElectricProcess.watt_number * activeElectricProcess.working_time;
        var kwhPerProd = kwh / production_capacity;
        var mjPerProd = mj / production_capacity;
        activeElectricProcess.dataValues.result = {kwh: kwh, mj:mj, mjPerProd: mjPerProd, kwhPerProd: kwhPerProd}

        const energiEkuivalenKayu = 0.1978
        var mj = activeWoodProcess.total_woods * energiEkuivalenKayu;
        var mjPerProd = mj/production_capacity;
        activeWoodProcess.dataValues.result =  {mj:mj, mjPerProd: mjPerProd}
        
        //emission electric

        var eSo2ElectricResultInaDay = kwh * eSo2electric
        var noxElectricResultInaDay = kwh * eNoxElectric
        var co2ElectricResultInaDay = kwh * eCo2Electric

        var eSo2ElectricResultInaDayOnKg = kwh * eSo2electric/1000 
        var noxElectricResultInaDayOnKg = kwh * eNoxElectric/1000
        var co2ElectricResultInaDayOnKg = kwh * eCo2Electric/1000

        var eSo2ElectricResultInaDayPerProduction = eSo2ElectricResultInaDayOnKg/production_capacity
        var noxElectricResultInaDayPerProduction = noxElectricResultInaDayOnKg/production_capacity
        var co2ElectricResultInaDayPerProduction = co2ElectricResultInaDayOnKg/production_capacity

        var eSo2ElectricResultInaDayPerProductionOnGram = eSo2ElectricResultInaDayPerProduction  * 1000;
        var noxElectricResultInaDayPerProductionOnGram = noxElectricResultInaDayPerProduction * 1000;
        var co2ElectricResultInaDayPerProductionOnGram = co2ElectricResultInaDayPerProduction * 1000;

        //emission wood
        var eSo2WoodResultInaDay = eSo2Wood * activeWoodProcess.total_woods;
        var noxWoodResultInaDay = eNoxWood * activeWoodProcess.total_woods;
        var co2WoodResultInaDay = eCo2Wood * activeWoodProcess.dataValues.mj / 1000;

        var eSo2WoodResultInaDayOnKg = eSo2ElectricResultInaDay/1000;
        var noxWoodResultInaDayOnKg = noxWoodResultInaDay/1000;
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
            activeElectricProcess: JSON.stringify(activeElectricProcess),
            human_process: JSON.stringify(currentHumanProcess),
            electric_emissions: JSON.stringify({ emissionElectricResults }),
            wood_emissions : JSON.stringify({emissionWoodResults})
        };



        const newWoodProcess = await Results.create({
            production_capacity: production_capacity,
            human_process_settings: result.human_process,
            wood_process_settings: result.activeWoodProcess,
            electric_process_settings: result.activeElectricProcess,
            wood_emissions: result.wood_emissions,
            electric_emissions: result.electric_emissions,
            user_id : req.user.id
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

exports.show = async (req, res) =>{
    try {
        const id = req.params.id;
        const result = await Results.findByPk(id);

        if (!result) {
        return res.status(404).json({ success: false, message: 'Wood Process not found' });
        }
        result.human_process_settings = JSON.parse(result.human_process_settings);
        result.electric_process_settings = JSON.parse(result.electric_process_settings);
        result.wood_process_settings = JSON.parse(result.wood_process_settings);

        return res.status(200).json({ success: true, message: 'Wood Process updated successfully', data: result });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error updating Wood Process', error: error.message });
    }
}

exports.index = async (req, res)=> {
    try {
        const { page = 1, pageSize = 5 } = req.query;
        const offset = (page - 1) * pageSize;

        const results = await Results.findAndCountAll({
        limit: +pageSize,
        offset,
        where: {user_id: req.user.id}
        
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

exports.destroy = async (req, res)=> {
    try{
        const id  = req.params.id;
        const result = await Results.findByPk(id)
        if(!result){
        return res.status(404).json({ success: false, message: 'result not found'});
        }
        await result.destroy();
        return res.status(200).json({
            success: true,
            message: 'result deleted',
            });
    }catch(error){
        return res.status(500).json({ success: false, message: 'Error retrieving wood process', error: error.message });

    }
}

exports.set = async (req, res)=> {
    try{
        const woodProcess = await WoodProcess.findByPk(req.params.id)
        if(!woodProcess){
            return res.status(404).json({success:false, message: "wood process not found"});
        }

        await woodProcess.update({is_active: !woodProcess.is_active})
        return res.status(200).json({
            success: true,
            message : 'wood process updated',
            data: woodProcess
        })
    }catch(error){
        return res.status(500).json({success: false, message: "error updating wood process", error: error.message})
    }
}

exports.getActive = async (req, res) => {
    try{
        const woodProcess = await WoodProcess.findOne({where: {user_id: 1, is_active: true}});
        if(!woodProcess){
            return res.status(404).json({
                success : true,
                message: 'active wood not found'
            });
        }
        return res.status(200).json({
            success: true,
            message : "get active wood process",
            data: woodProcess
        });
        
    }catch(error){
        return res.status(500).json({success: false, message: "error getting wood process", error: error.message})
    }
}

exports.downloadResult =async (req, res)=> {
    try {
        const id = req.params.id;
        const result = await Results.findByPk(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Wood Process not found' });
        }

        let human_process_settings = JSON.parse(result.human_process_settings);
        let electric_process_settings = JSON.parse(result.electric_process_settings);
        let wood_process_settings = JSON.parse(result.wood_process_settings);
        human_process_settings = human_process_settings.map(item=>([item.process_name, item.male_resource, item.female_resource, item.working_time, item?.result?.human_energy?.toFixed(4), item?.result?.human_energy_each_production.toFixed(4)]))
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
        
        const table = {
            title: 'Laporan Penghitungan LCA TGL',
            subtitle: 'Pengaturan Proses Manusia',
            headers: ['Nama Proses', 'Sumber Daya Pria', 'Sumber Daya Wanita', 'Waktu Kerja', 'human energy', 'human energy each process'],
            rows: human_process_settings,
        };

        await doc.table(table, {
            width: 500,
        });
        console.log(wood_process_settings);

        doc.moveDown();
        
        const table2 = {
            subtitle: 'Pengaturan Proses Listrik',
            headers: ['Nama Proses', 'Konsumsi Energi (kWh)', 'Konsumsi Energi (MJ)', 'MJ/Kg', 'kWh/Kg'
        ],
            rows: [
                ['Pencucian dan Perendaman', electric_process_settings.result.kwh.toFixed(4), electric_process_settings.result.mj.toFixed(4), electric_process_settings.result.mjPerProd.toFixed(4), electric_process_settings.result.kwhPerProd.toFixed(4)]
            ],
        };

        await doc.table(table2, {
            width: 300,
        });

        doc.moveDown();
        const table3 = {
            subtitle: 'Pengaturan Proses Listrik',
            headers: ['Nama Proses', 'Energi (MJ/Hari)', 'Energi (MJ/Kg)'
        ],
            rows: [
                ['Perebusan', wood_process_settings.result.mj.toFixed(4), wood_process_settings.result.mjPerProd.toFixed(4)]
            ],
        };

        await doc.table(table3, {
            width: 300,
        });

        doc.end();
    } catch (error) {
        console.error('Error in downloadResult:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
    

}