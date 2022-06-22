const {addressToScript} = require("@nervosnetwork/ckb-sdk-utils");
const {collectInputs, getCells, FEE, CKB_MIN_CAPACITY} = require("./utils");
const CKB = require("@nervosnetwork/ckb-sdk-core").default;

const CKB_INDEXER = "https://mainnet.ckb.dev/indexer";
const CKB_NODE = "https://mainnet.ckb.dev/rpc";
const COTA_TYPE = {
  codeHash: "0x1122a4fb54697cf2e6e3a96c9d80fd398a936559b90954c6e88eb7ba0cf652df",
  hashType: "type",
  args: "0x",
};
const CELL_DEPS = [
  {
    outPoint: {txHash: "0x207c0ab1a25f63198c0cb73a9f201585ac39619e0a32cb2339e7cd95858dbe72", index: "0x0"},
    depType: "depGroup",
  },
  {
    outPoint: {
      txHash: "0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c",
      index: "0x0",
    },
    depType: "depGroup",
  },
];

const PRIVATE_KEY = "";
const Address = "";
const COTA_CKB_CAPACITY = BigInt(200) * BigInt(100000000);

const run = async () => {
  const ckb = new CKB(CKB_NODE);
  const lock = addressToScript(Address);
  const cotaCells = await getCells(CKB_INDEXER, lock, COTA_TYPE);
  if (!cotaCells || cotaCells.length === 0) {
    throw new Error("Cota cell doesn't exist");
  }
  const cotaCell = cotaCells[0];

  const liveCells = await getCells(CKB_INDEXER, lock);
  const {inputs: normalInputs, capacity: sumCapacity} = await collectInputs(liveCells, COTA_CKB_CAPACITY + CKB_MIN_CAPACITY, FEE);

  const inputs = [
    ...normalInputs,
    {
      previousOutput: cotaCell.outPoint,
      since: "0x0",
    },
  ];

  let outputs = [cotaCell.output];
  outputs[0].capacity = `0x${COTA_CKB_CAPACITY.toString(16)}`;

  const changeOutput = {
    capacity: sumCapacity - COTA_CKB_CAPACITY - FEE,
    lock,
    type: null,
  };
  outputs[1] = changeOutput;

  const outputsData = [cotaCell.outputData, "0x"];

  const rawTx = {
    version: "0x0",
    cellDeps: CELL_DEPS,
    headerDeps: [],
    inputs,
    outputs,
    outputsData,
    witnesses: [],
  };

  rawTx.witnesses = rawTx.inputs.map((_, i) => (i > 0 ? "0x" : {lock: "", inputType: "", outputType: ""}));

  console.log(rawTx);

  const signedTx = ckb.signTransaction(PRIVATE_KEY)(rawTx);
  let txHash = await ckb.rpc.sendTransaction(signedTx, "passthrough");
  console.info(`tx hash ${txHash}`);
};

run();
