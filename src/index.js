// Hot reloading
import * as _unused from "raw-loader!./index.ejs";

import Chart from "./chart.svelte"

const target = document.getElementById("chart");
const chart = new Chart({ target });
