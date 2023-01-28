function clearDesk() {
    /* Delete all the saved data when the "clear all" button is pressed. */

    const graphs_area = document.getElementById('graphs_area');
    const experiments_list = document.getElementById("experiments_list");

    graphs_area.replaceChildren();
    experiments_list.replaceChildren();
    localStorage.clear();

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