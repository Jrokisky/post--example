// Wraps the most awesome d3-annotation component (https://d3-annotation.susielu.com/)
// so that it can be rendered as a series

import { scaleLinear, select } from 'd3'
import { dataJoin, rebindAll } from "d3fc"
import { annotation } from "d3-svg-annotation"

export const seriesSvgAnnotation = () => {
  // the underlying component that we are wrapping
  const d3Annotation = annotation();

  let xScale = scaleLinear();
  let yScale = scaleLinear();

  const join = dataJoin("g", "annotation");

  const series = selection => {
    selection.each((data, index, group) => {
      const projectedData = data.map(d => ({
        ...d,
        x: xScale(d.x),
        y: yScale(d.y)
      }));

      d3Annotation.annotations(projectedData);

      join(select(group[index]), projectedData).call(d3Annotation);
    });
  };

  series.xScale = (...args) => {
    if (!args.length) {
      return xScale;
    }
    xScale = args[0];
    return series;
  };

  series.yScale = (...args) => {
    if (!args.length) {
      return yScale;
    }
    yScale = args[0];
    return series;
  };

  rebindAll(series, d3Annotation);

  return series;
};
