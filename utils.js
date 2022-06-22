const axios = require("axios");
const camelcaseKeys = require("camelcase-keys");

const CKB_MIN_CAPACITY = BigInt(61) * BigInt(100000000);
const FEE = BigInt(2000);

const getCells = async (indexerUrl, lock, type) => {
  const filter = type
    ? {
        script: {
          code_hash: type.codeHash,
          hash_type: type.hashType,
          args: type.args,
        },
      }
    : {
        script: null,
        output_data_len_range: ["0x0", "0x1"],
      };
  let payload = {
    id: 1,
    jsonrpc: "2.0",
    method: "get_cells",
    params: [
      {
        script: {
          code_hash: lock.codeHash,
          hash_type: lock.hashType,
          args: lock.args,
        },
        script_type: "lock",
        filter,
      },
      "asc",
      "0x64",
    ],
  };
  const body = JSON.stringify(payload, null, "  ");
  let response = (
    await axios({
      method: "post",
      url: indexerUrl,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 20000,
      data: body,
    })
  ).data;
  if (response.error) {
    console.error(response.error);
    throw Error("Get cells error");
  } else {
    return toCamelcase(response.result.objects);
  }
};

const collectInputs = async (liveCells, needCapacity, fee) => {
  let inputs = [];
  let sum = BigInt(0);
  for (let cell of liveCells) {
    inputs.push({
      previousOutput: {
        txHash: cell.outPoint.txHash,
        index: cell.outPoint.index,
      },
      since: "0x0",
    });
    sum = sum + BigInt(cell.output.capacity);
    if (sum >= needCapacity + CKB_MIN_CAPACITY + fee) {
      break;
    }
  }
  if (sum < needCapacity + fee) {
    throw Error("Capacity not enough");
  }
  if (sum < needCapacity + CKB_MIN_CAPACITY + fee) {
    throw Error("Capacity not enough for change");
  }
  return {inputs, capacity: sum};
};

const toCamelcase = (object) => {
  try {
    return JSON.parse(
      JSON.stringify(
        camelcaseKeys(object, {
          deep: true,
        })
      )
    );
  } catch (error) {
    console.error(error);
  }
  return null;
};

module.exports = {
  CKB_MIN_CAPACITY,
  FEE,
  collectInputs,
  getCells,
};
