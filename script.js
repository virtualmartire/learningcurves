function gotFiles(input) {

    const file_list = Array.from(input.files);

    file_list.forEach((file) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {     // because asynchrony
            const json_string = reader.result;
            const run_name = file.name;
            localStorage.setItem(run_name, json_string);
            drawCurves(JSON.parse(json_string));
        });
        reader.readAsText(file);
    });

}

function drawCurves(json_curves) {

    const new_graph = document.createElement('canvas');
    const run_name = Object.keys(json_curves)[0];
    const graphs_area = document.getElementById('graphs_area');
    new_graph.id = run_name;
    new_graph.classList.add("graph");
    graphs_area.appendChild(new_graph);

    var xValues = [50,60,70,80,90,100,110,120,130,140,150];
    var yValues = [7,8,8,9,9,9,10,11,14,14,15];

    new Chart(run_name, {
    type: "line",
    data: {
        labels: xValues,
        datasets: [{
        fill: false,
        lineTension: 0,
        backgroundColor: "rgba(0,0,255,1.0)",
        borderColor: "rgba(0,0,255,0.1)",
        data: yValues
        }]
    },
    options: {
        legend: {display: false},
        scales: {
        yAxes: [{ticks: {min: 6, max:16}}],
        }
    }
    });
}