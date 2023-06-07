import * as d3 from 'd3';

class LineChart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // Set dimensions and margins for the chart
    const margin = { top: 70, right: 30, bottom: 40, left: 80 };
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Read data attributes
    const file = this.getAttribute("data-file");
    console.log(file);
    //const x_data = this.getAttribute("data-x"); // To-do?
    //const y_data = this.getAttribute("data-y"); // To-do?

    // Set up x and y scales
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // Create SVG element
    const lineChartSvg = d3
      .create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("version", "1.1");

    // Read data
    // Example dataset downloaded from https://en.ilmatieteenlaitos.fi/download-observations
    d3.csv(file).then((data: any[]) => {
      data.forEach((d: any) => {
        const temp_date = d.Year + "-" + d.m + "-" + d.d;
        d.date = new Date(temp_date);
        d.temperature = +d.temperature;
      });
      console.log(data);

      // Define x and y domains
      x.domain(d3.extent(data, (d: any) => d.date));
      y.domain([
        d3.min(data, (d: any) => d.temperature - 5),
        d3.max(data, (d: any) => d.temperature),
      ]);

      // Add x-axis
      lineChartSvg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(d3.timeMonth.every(1))
            .tickFormat(d3.timeFormat("%b %Y"))
        );

      // Add y-axis
      lineChartSvg.append("g").call(d3.axisLeft(y));

      // Create line generator
      const line = d3
        .line<any>()
        .x((d) => x(d.date))
        .y((d) => y(d.temperature));

      // Add line path to the SVG element
      lineChartSvg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("d", line);
    });

    this.shadowRoot!.appendChild(lineChartSvg.node()!);
  }
}

function comparator(a: number, b: number) {
  return a - b;
}

customElements.define("line-chart", LineChart);