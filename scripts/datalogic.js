function clearDesk() {
    /* Delete all the saved data when the "clear all" button is pressed. */

    const graphs_area = document.getElementById('graphs_area');
    const experiments_list = document.getElementById("experiments_list");

    graphs_area.replaceChildren();
    experiments_list.replaceChildren();
    localStorage.clear();
    Object.values(Chart.instances).map(chart_obj => chart_obj.canvas.id = "trash");  // to remove all the references
    hexadecimal_dict.counter = 0;

}

function gotFiles(input) {
    /* The function that fires when some files are loaded. */

    const file_list = Array.from(input.files);

    file_list.forEach((file) => {
        const reader = new FileReader();
        reader.addEventListener("load", reader => saveAndShowFile(JSON.parse(reader.target.result)));      // because asynchrony
        reader.readAsText(file);
    });

}

function saveAndShowFile(input_dict) {

    const runs_names_array = Object.keys(input_dict);

    runs_names_array.forEach(run_name => {

        const run_dict = input_dict[run_name];
        const metrics_names_array = Object.keys(run_dict);

        saveRun(run_name, run_dict);      // data are stored per-run
        assignColor(run_name);
        metrics_names_array.forEach((metric_name) => {
            const metric_data = run_dict[metric_name];
            updateExperimentsListHTML(run_name);
            drawCurve(metric_name, run_name, metric_data);
        })

    })

}

function saveRun(run_name, run_dict) {
    // Runs are assumed to be always updated and never taken back to past results
    localStorage.setItem(run_name, JSON.stringify(run_dict));
}

function deleteRun(run_name) {

    const run_dict = JSON.parse( localStorage.getItem(run_name) );
    const metrics_names_array = Object.keys(run_dict);

    // Delete the item on the experiment list
    document.getElementById(run_name).remove();

    // Delete the run on every chart
    metrics_names_array.forEach(metric_name => {

        var chart = getChartObjectById(metric_name);
        var chart_datasets = chart.data.datasets;

        removeRunFromChart(chart, run_name);

        // Delete the entire chart if it remains empty
        if (chart_datasets.length == 0) {
            document.getElementById(chart.canvas.id).remove();
            chart.canvas.id = "trash";  // to have nomore references
        }

        chart.update();

    });

    // Delete the run from localStorage
    localStorage.removeItem(run_name);

}

function exportDesk() {

    const cached_runs = _.mapValues(localStorage, JSON.parse);
    var link = document.createElement('a');
    var date = new Date();

    date = date.toLocaleDateString().replace(/\//g, '_');
    link.setAttribute('download', `learningcurves_${date}_.json`);
    link.href = makeTextFile(JSON.stringify(cached_runs));
    document.body.appendChild(link);

    window.requestAnimationFrame(function () {
        var event = new MouseEvent('click');
        link.dispatchEvent(event);
        document.body.removeChild(link);
    });

}

function makeTextFile(text) {
    const data = new Blob([text], {type: 'text/plain'});
    textFile = window.URL.createObjectURL(data);
    return textFile;        // returns a URL you can use as a href
};