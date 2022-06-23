const TESTNET_CKB_INDEXER = "https://testnet.ckb.dev/indexer";
const MAINNET_CKB_INDEXER = "https://mainnet.ckb.dev/indexer";

const TESTNET_CKB_NODE = "https://testnet.ckb.dev/rpc";
const MAINNET_CKB_NODE = "https://mainnet.ckb.dev/rpc";

const TESTNET_COTA_TYPE = {
  codeHash: "0x89cd8003a0eaf8e65e0c31525b7d1d5c1becefd2ea75bb4cff87810ae37764d8",
  hashType: "type",
  args: "0x",
};

const MAINNET_COTA_TYPE = {
  codeHash: "0x1122a4fb54697cf2e6e3a96c9d80fd398a936559b90954c6e88eb7ba0cf652df",
  hashType: "type",
  args: "0x",
};

const TESTNET_CELL_DEPS = [
  {
    outPoint: {txHash: "0xfa683440f605af7cc117755f8bcf6acec70fc4a69265602117810dfa41444159", index: "0x0"},
    depType: "depGroup",
  },
  {
    outPoint: {
      txHash: "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
      index: "0x0",
    },
    depType: "depGroup",
  },
];

const MAINNET_CELL_DEPS = [
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

const ckbNode = (isMainnet = false) => isMainnet ? MAINNET_CKB_NODE : TESTNET_CKB_NODE
const ckbIndexer = (isMainnet = false) => isMainnet ? MAINNET_CKB_INDEXER : TESTNET_CKB_INDEXER
const cotaType = (isMainnet = false) => isMainnet ? MAINNET_COTA_TYPE : TESTNET_COTA_TYPE
const cellDeps = (isMainnet = false) => isMainnet ? MAINNET_CELL_DEPS : TESTNET_CELL_DEPS


module.exports = {
  ckbNode,
  ckbIndexer,
  cotaType,
  cellDeps
}