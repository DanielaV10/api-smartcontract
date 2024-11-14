import express from 'express';
import bodyParser from 'body-parser';
import Web3 from "web3";
import cors from 'cors';


const app = express();
const corsOptions = {
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'] ,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

const web3 = new Web3('https://arb-sepolia.g.alchemy.com/v2/A2RfRIpLsoGYB8Lgz_CFvvd0L8p53DbO');

const contractAddress = "0xff7155795429e117629f5087e720ac5d8b18cc66" 
const private_key = "ff6f0edc0c164e5ec929ff1b1826e354324ed4e61a2c52150e094bfdd314da90";
const fromAccount = "0x63f91DDCf5b144700d1fcB7AB10b0ECcCd9A5aFa";

const contractAbi = [{"inputs":[],"name":"getAllRentPlazas","outputs":[{"components":[{"internalType":"string","name":"cedulaAbonado","type":"string"},{"internalType":"string","name":"numberPlaza","type":"string"},{"internalType":"string","name":"montoSemanaMes","type":"string"},{"internalType":"string","name":"duracion","type":"string"},{"internalType":"string","name":"tipo","type":"string"},{"internalType":"string","name":"fechaInicio","type":"string"},{"internalType":"string","name":"montoTotal","type":"string"},{"internalType":"string","name":"detalle","type":"string"},{"internalType":"bool","name":"availableForRent","type":"bool"}],"internalType":"struct PlanAbonadoContract.RentPlaza[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_numberPlaza","type":"string"}],"name":"getPlanAbonadoContract","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_numberPlaza","type":"string"}],"name":"makePlazaAvailable","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"numbersPlaza","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_cedulaAbonado","type":"string"},{"internalType":"string","name":"_numberPlaza","type":"string"},{"internalType":"string","name":"_montoSemanaMes","type":"string"},{"internalType":"string","name":"_duracion","type":"string"},{"internalType":"string","name":"_tipo","type":"string"},{"internalType":"string","name":"_fechaInicio","type":"string"},{"internalType":"string","name":"_montoTotal","type":"string"},{"internalType":"string","name":"_detalle","type":"string"}],"name":"registerRent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"rentPlazas","outputs":[{"internalType":"string","name":"cedulaAbonado","type":"string"},{"internalType":"string","name":"numberPlaza","type":"string"},{"internalType":"string","name":"montoSemanaMes","type":"string"},{"internalType":"string","name":"duracion","type":"string"},{"internalType":"string","name":"tipo","type":"string"},{"internalType":"string","name":"fechaInicio","type":"string"},{"internalType":"string","name":"montoTotal","type":"string"},{"internalType":"string","name":"detalle","type":"string"},{"internalType":"bool","name":"availableForRent","type":"bool"}],"stateMutability":"view","type":"function"}]


const contract = new web3.eth.Contract(contractAbi, contractAddress);

async function rentPlaza(cedulaAbonado, numberPlaza, montoSemanaMes,montoTotal,fechaInicio,duracion,tipo,detalle) {
    const data = contract.methods.registerRent(cedulaAbonado, numberPlaza, montoSemanaMes,montoTotal,fechaInicio,duracion,tipo,detalle).encodeABI();
    const gasPrice = await web3.eth.getGasPrice();
    const estimatedGas = await web3.eth.estimateGas({ from: fromAccount, to: contractAddress,data: data});
    const transactionObject = { from: fromAccount,to: contractAddress,data: data, gas: estimatedGas,  gasPrice: gasPrice};
    const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, private_key);
    const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    return receipt.transactionHash
}




async function makePlazaAvailable(numberPlaza) {
    const data = contract.methods.makePlazaAvailable(numberPlaza).encodeABI(); 
    const gasPrice = await web3.eth.getGasPrice();
    const estimatedGas = await web3.eth.estimateGas({ from: fromAccount, to: contractAddress, data: data });
    const transactionObject = { from: fromAccount, to: contractAddress, data: data, gas: estimatedGas, gasPrice: gasPrice };
    const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, private_key);
    const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    return receipt.transactionHash;
}





app.post('/api/rent-plaza', async(req, res) => {
    console.log(req.body)
    const data = await rentPlaza(req.body.cedulaAbonado, req.body.numberPlaza,req.body.montoSemanaMes,req.body.duracion,req.body.tipo,req.body.fechaInicio,req.body.montoTotal,req.body.detalle)
    res.json({
        trxhash: data
    });
});



app.post('/api/make-room-available', async (req, res) => {
    console.log(req.body);
    const data = await makePlazaAvailable(req.body.numberPlaza);  // Cambié `makeRoomAvailable` por `makePlazaAvailable`
    res.json({
        trxhash: data
    });
});


// Endpoint para obtener todos los contratos de habitaciones registradas
app.get('/api/get-all-rent-plazas', async (req, res) => {
    try {
        const allPlazas = await contract.methods.getAllRentPlazas().call();
        res.json({ status: "success", data: allPlazas });
    } catch (error) {
        console.error("Error en getAllRentRooms:", error);
        res.status(500).json({ status: "error", message: "Error ejecutando getAllRentPlazas", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});