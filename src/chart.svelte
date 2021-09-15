<script>
    import { onMount } from 'svelte'
    import { seriesWebglPoint, chartCartesian, seriesWebglMulti, webglFillColor, pointer, seriesSvgMulti } from "d3fc"
    import { zoom, scaleLinear, zoomIdentity } from "d3"
    import { annotationCallout } from 'd3-svg-annotation'
    import { seriesSvgAnnotation } from './annotation-series'
    import * as d3 from 'd3'

    import points from './point-generator'


    const xScale = scaleLinear().domain([0, 20]);
    const yScale = scaleLinear().domain([0, 20]);
    const xScaleOriginal = xScale.copy();
    const yScaleOriginal = yScale.copy()

    let data = []
    let filtered_data = []
    const annotations = []

    let filter_val = 0
    let quadtree


    $: {
        filter_val
        filtered_data = applyFilters()
        buildQuadTree()
        setFills()
        redraw()
    }

    // Data ops.
    function applyFilters() {
        return data.filter(x => x.tc > filter_val/100)
    }

    const setFills = () => {
        const fillColor = webglFillColor().value(x => webglColor(x.color)).data(filtered_data)
        pointSeries.decorate(program => fillColor(program))
    }

    const buildQuadTree = () => quadtree = d3.quadtree().x(d => d.x).y(d => d.y).addAll(filtered_data)

    /// D3FC data and charting
    const redraw = () => {
        d3.select("#canvas").datum({ annotations, filtered_data }).call(chart)
    }

    const pointSeries = seriesWebglPoint()
        .equals((a, b) => a === b)
        .size(d => d.size)
        .crossValue(d => d.x)
        .mainValue(d => d.y)

    const annotationSeries = seriesSvgAnnotation().notePadding(15).type(annotationCallout)

    const _zoom = zoom()
        .scaleExtent([0.8, 20])
        .on("zoom", (e) => {
            console.log(e.transform)
            xScale.domain(e.transform.rescaleX(xScaleOriginal).domain());
            yScale.domain(e.transform.rescaleY(yScaleOriginal).domain());
            redraw()
        })

    const createAnnotationData = datapoint => ({
        note: {
            label: 'Description Text<br>Testing',
            bgPadding: 5,
            title: 'Title<sub>c</sub>'
        },
        x: datapoint.x,
        y: datapoint.y,
        dx: 20,
        dy: 20
    })

    const _pointer = pointer().on("point", ([coord]) => {
        // annotations.pop()
        if (coord) {
            // find the closes datapoint to the pointer
            const x = xScale.invert(coord.x);
            const y = yScale.invert(coord.y);
            const radius = Math.abs(xScale.invert(coord.x) - xScale.invert(coord.x - 20));
            const closestDatum = quadtree.find(x, y, radius);
            console.log(closestDatum)

            if (closestDatum) {
                annotations[0] = createAnnotationData(closestDatum);
            }
        }
        redraw()
    })

    const chart = chartCartesian(xScale, yScale)
        .webglPlotArea(
            seriesWebglMulti().series([pointSeries]).mapping(d => d.filtered_data).key(d => d.id)
        )
        .svgPlotArea(
            // only render the annotations series on the SVG layer
            seriesSvgMulti().series([annotationSeries]).mapping(d => d.annotations)
        )
        .decorate(sel => {
            sel.enter().select("d3fc-svg.plot-area")
                .on("measure.range", (e) => {
                    // Map to actual pixel values.
                    xScaleOriginal.range([0, e.detail.width]);
                    yScaleOriginal.range([e.detail.height, 0]);
                })
                .call(_zoom)
                .call(_pointer)
        })



    onMount(() => {
        data = points.p1
        filtered_data = applyFilters(data)
        buildQuadTree()
        setFills()
        redraw()
    })

    //// BUTTON FUNCTIONS
    const reset = () => {
        d3.select("d3fc-canvas.plot-area").transition().duration(2500).call(_zoom.transform, zoomIdentity)
    }

    const addP2 = () => {
        data = points.p1.concat(points.p2)
        filtered_data = applyFilters()
        buildQuadTree()
        setFills()
        const transform = zoomIdentity.translate(-380, -63).scale(1.7)
        d3.select("d3fc-canvas.plot-area").transition().duration(2500).call(_zoom.transform, transform)
    }

    //// UTIL FUNCTIONS
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
