const fs = require("fs").promises;

function getDataKeys(data) {
    const l = data.length;
    const keys = new Set();
    for (let i = 0; i < l; i++) {
        const obj = data[i];
        for (let key of Object.keys(obj)) {
            if (key == "indicator") { continue; }
            keys.add(key);
        }
    }
    return [...keys];
}

function asRow(obj, header) {
    return header.map((key) => {
        if (key in obj && obj[key]) {
            const v = obj[key].toString();
            if (v.indexOf(",") > -1) {
                v = '"' + v + '"';
            }
            return v;
        } else {
            return "";
        }
    });
}

function getDataRows(data, header) {
    return data.map((obj) => asRow(obj, header));
}

async function exportTimeseries(indicator, subkey, indicatorData) {
    if (!indicatorData) { return; }
    const header = getDataKeys(indicatorData);
    subkey = subkey.replace("/", "-");
    const filename = (indicator !== subkey) ? `./data/${indicator}-${subkey}.csv` : `./data/${subkey}.csv`;

    const rows = getDataRows(indicatorData, header);

    let dataStr = header.join(", ") + "\n";
    for (let i = 0; i < rows.length; i++) {
        dataStr += rows[i].join(", ");
        dataStr += "\n";
    }
    console.log(indicator, subkey, header);

    await fs.writeFile(filename, dataStr, "utf-8");
}

(async () => {
    let data = await fs.readFile("./data.json");
    data = JSON.parse(data);
    delete data.descriptions;

    for (let indicator of Object.keys(data)) {
        const indicatorData = data[indicator];
        for (let subkey of Object.keys(indicatorData)) {
            tsData = indicatorData[subkey];
            await exportTimeseries(indicator, subkey, tsData);
        }
    }
})();
