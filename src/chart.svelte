<script>
    import { onMount, setContext } from 'svelte'
    import { seriesWebglPoint, chartCartesian, seriesWebglMulti, webglFillColor } from "d3fc"
    import { zoom, scaleLinear, zoomIdentity, zoomTransform } from "d3"
    import * as d3 from 'd3'

    import points from './point-generator'


    const xScale = scaleLinear().domain([0, 20]);
    const yScale = scaleLinear().domain([0, 20]);
    const xScaleOriginal = xScale.copy();
    const yScaleOriginal = yScale.copy()

    let data = []
    let filtered_data = []

    let filter_val = 0

    const redraw = () => {
        d3.select("#canvas").datum({ filtered_data }).call(chart);
    }

    $: {
        filter_val
        filtered_data = applyFilters()
        setFills()
        redraw()
    }

    function applyFilters() {
        return data.filter(x => x.tc > filter_val/100)
    }

    const pointSeries = seriesWebglPoint()
        .equals((a, b) => a === b)
        .size(d => d.size)
        .crossValue(d => d.x)
        .mainValue(d => d.y)

    const _zoom = zoom()
        .scaleExtent([0.8, 20])
        .on("zoom", (e) => {
            console.log(e.transform)
            console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`')
            xScale.domain(e.transform.rescaleX(xScaleOriginal).domain());
            yScale.domain(e.transform.rescaleY(yScaleOriginal).domain());
            redraw()
        })

    const chart = chartCartesian(xScale, yScale)
        .webglPlotArea(
            seriesWebglMulti().series([pointSeries]).mapping(d => d.filtered_data).key(d => d.id)
        )
        .decorate(sel => {
            sel.enter().select("d3fc-canvas.plot-area")
                .on("measure.range", (e) => {
                    // Map to actual pixel values.
                    xScaleOriginal.range([0, e.detail.width]);
                    yScaleOriginal.range([e.detail.height, 0]);
                })
                .call(_zoom)
        })



    const setFills = () => {
        const fillColor = webglFillColor().value(x => webglColor(x.color)).data(filtered_data)
        pointSeries.decorate(program => fillColor(program))
    }

    onMount(() => {
        data = points.p1
        filtered_data = applyFilters(data)
        setFills()
        redraw()
    })

    const reset = () => {
        d3.select("d3fc-canvas.plot-area").transition().duration(2500).call(_zoom.transform, zoomIdentity)
    }

    const addP2 = () => {
        data = points.p1.concat(points.p2)
        filtered_data = applyFilters()
        setFills()
        const transform = zoomIdentity.translate(-380, -63).scale(1.7)
        d3.select("d3fc-canvas.plot-area").transition().duration(2500).call(_zoom.transform, transform)
    }

    const webglColor = color => {
        const {r, g, b, opacity} = d3.color(color).rgb();
        return [r / 255, g / 255, b / 255, opacity];
    }

</script>

<style>
    #canvas {
        height: 600px;
        width: 600px;
    }

</style>


<div id="canvas">
</div>
<button on:click={reset}>Reset</button>
<button on:click={addP2}>Add p2</button>
<input type="range" bind:value={filter_val}/>
