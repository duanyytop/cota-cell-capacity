const {addressToScript} = require("@nervosnetwork/ckb-sdk-utils");
const {collectInputs, getCells, FEE, CKB_MIN_CAPACITY} = require("./utils");
const CKB = require("@nervosnetwork/ckb-sdk-core").default;
const {ckbNode, ckbIndexer, cellDeps, cotaType} = require('./constant')

const PRIVATE_KEY = "0x-private-key";
const Address = "ckt1qyq897k5m53wxzup078jwkucvvsu8kzv55rqqm6glm";
const COTA_CKB_CAPACITY = BigInt(200) * BigInt(100000000);

const run = async (isMainnet = false) => {
  const ckb = new CKB(ckbNode(isMainnet));
  const lock = addressToScript(Address);

  const cotaCells = await getCells(ckbIndexer(isMainnet), lock, cotaType(isMainnet));
  if (!cotaCells || cotaCells.length === 0) {
    throw new Error("Cota cell doesn't exist");
  }
  const cotaCell = cotaCells[0];

  const liveCells = await getCells(ckbIndexer(isMainnet), lock);
  const inputCotaCapacity = BigInt(cotaCell.output.capacity)
  const needCapacity = COTA_CKB_CAPACITY + CKB_MIN_CAPACITY - inputCotaCapacity
  const {inputs: normalInputs, capacity: sumCapacity} = await collectInputs(liveCells, needCapacity, FEE);

  const inputs = [
    {
      previousOutput: cotaCell.outPoint,
      since: "0x0",
    },
    ...normalInputs,
  ];

  let outputs = [cotaCell.output];
  outputs[0].capacity = `0x${COTA_CKB_CAPACITY.toString(16)}`;

  let inputSumCapacity = sumCapacity + inputCotaCapacity 
  const changeOutput = {
    capacity: inputSumCapacity - COTA_CKB_CAPACITY - FEE,
    lock,
    type: null,
  };
  outputs[1] = changeOutput;

  const outputsData = [cotaCell.outputData, "0x"];

  const rawTx = {
    version: "0x0",
    cellDeps: cellDeps(isMainnet),
    headerDeps: [],
    inputs,
    outputs,
    outputsData,
    witnesses: [],
  };

  rawTx.witnesses = rawTx.inputs.map((_, i) => (i > 0 ? "0x" : {lock: "", inputType: "", outputType: ""}));

  const signedTx = ckb.signTransaction(PRIVATE_KEY)(rawTx);
  let txHash = await ckb.rpc.sendTransaction(signedTx, "passthrough");
  console.info(`tx hash ${txHash}`);
};

run();
