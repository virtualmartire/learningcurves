function openNav() {
    /* Open the side menu */
    document.getElementById("experiments_area").style.width = "288px";
}

function closeNav() {
    /* Close the side menu */
    document.getElementById("experiments_area").style.width = "0px";
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

    // Prepare the view
    hideAllDivs();
    showDataZone();
    buttonDivChartsMode();

    // Save and show the data
    
    const runs_names_array = Object.keys(input_dict);

    runs_names_array.forEach(run_name => {

        const run_dict = input_dict[run_name];
        const metrics_names_array = Object.keys(run_dict);

        saveRunToLocalStorage(run_name, run_dict);      // data are stored per-run
        assignColor(run_name);
        metrics_names_array.forEach((metric_name) => {

            const metric_data = run_dict[metric_name];

            updateExperimentsListHTML(run_name);

            addValuesToChart(metric_name, run_name, metric_data);     // it creates the chart object and the data-div HTML if needed
            getChartObjectById(metric_name).update();

            addStatisticsDivs(metric_name, run_name);
            computeAndAddStatistics(metric_name, run_name);

        });

    });

    setTimeout(() => {      // in order to catch the right dimensions
        resetDataDivHeight();
        resetDataDivBorders();
    }, 200);

}

function deleteRun(run_name) {
    /* The action triggered by the del buttons. */

    // Delete the item from the experiments list
    document.getElementById(`${run_name}_experiment_li`).remove();

    // Delete the run from every chart
    deleteRunFromEveryChart(run_name);

    // Delete all run statistics
    document.querySelectorAll(`.${run_name}_statistics`).forEach(node => node.remove());

    // Delete the run from localStorage (this has to be the final step)
    localStorage.removeItem(run_name);

    // Restore the now-free color and reset the height of all the statistics div
    hexadecimal_dict.palette_to_consume.push(hexadecimal_dict[run_name]);
    delete hexadecimal_dict[run_name];
    resetDataDivHeight();

}

function switchHideShow(run_name) {
    /* The action triggered by the hide buttons. */

    const run_name_div = document.getElementById(`${run_name}_experiment_li`);
    
    if (run_name_div.style.backgroundColor != 'rgba(0, 0, 0, 0)') {

        hideRun(run_name);

    } else {    // if the run is already hidden

        showRun(run_name);

    };

    resetDataDivHeight();

}

function showOnlyThisRun(run_name) {
    /* The action triggered when a hide button is double clicked. */

    Object.keys(localStorage).forEach(general_run_name => {
        if (general_run_name == run_name) {showRun(general_run_name)}
        else {hideRun(general_run_name)}
    })

}

function clearDesk() {
    /* Delete all the saved data when the "clear" button is pressed. */

    Object.keys(localStorage).forEach(deleteRun);
    document.getElementById("landing_message").style.display = 'flex';
    document.getElementById("background_image").style.display = 'block';

    buttonDivLoadMode();

}

function exportDesk() {
    /* The action triggered by the export button. */

    const visible_runs_names = Array.from(document.querySelectorAll('.exp_list_run_divs'))
                                .filter(node => node.style.backgroundColor != 'rgba(0, 0, 0, 0)')
                                .map(node => node.id.slice(0, -14));
    const visible_runs = _.pick(_.mapValues(localStorage, JSON.parse), visible_runs_names);
    const link = document.createElement('a');
    var date = new Date();

    date = date.toLocaleDateString().replace(/\//g, '_');
    link.setAttribute('download', `learningcurves_${date}_.json`);
    link.href = makeTextFile(JSON.stringify(visible_runs));
    document.body.appendChild(link);

    window.requestAnimationFrame(function () {
        const event = new MouseEvent('click');
        link.dispatchEvent(event);
        document.body.removeChild(link);
    });

}

function halfYMax(metric_name) {

    const chart = getChartObjectById(metric_name);

    // Save the current zoom levels
    zoom_history[metric_name].push(extractChartRanges(chart));

    // Zoom
    chart.options.scales.y.max = chart.scales.y._range.max / 2;
    chart.update();

}

function zoomBack(metric_name) {

    const chart = getChartObjectById(metric_name);
    const zoom_levels = zoom_history[metric_name].pop();

    chart.options.scales.y.max = zoom_levels['y_max'];
    chart.options.scales.y.min = zoom_levels['y_min'];
    chart.options.scales.x.max = zoom_levels['x_max'];
    chart.options.scales.x.min = zoom_levels['x_min'];

    chart.update();

}

async function loadExamples() {

    // Clear the desk
    localStorage.clear();

    // Write the sample data on localStorage
    const sample_data = await fetch('./sample_data.json');
    const sample_data_json = await sample_data.json();
    Object.keys(sample_data_json).forEach(run_name => {
        saveRunToLocalStorage(run_name, sample_data_json[run_name]);
    });

    // Relaunch the app
    window.location.href = "index.html";

}

function dropHandler(ev) {

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    // Read the file(s)
    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...ev.dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === "file") {
                const file = item.getAsFile();
                const reader = new FileReader();
                reader.addEventListener("load", reader => saveAndShowFile(JSON.parse(reader.target.result)));      // because asynchrony
                reader.readAsText(file);
            }
        });
    } else {
        // Use DataTransfer interface to access the file(s)
        [...ev.dataTransfer.files].forEach((file, i) => {
            const reader = new FileReader();
            reader.addEventListener("load", reader => saveAndShowFile(JSON.parse(reader.target.result)));      // because asynchrony
            reader.readAsText(file);
        });
    }

    // Mod the style
    document.getElementById("drop_cartel").style.display = 'none';

}

function dragOverHandler(ev) {    
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    // Mod the style
    document.getElementById("drop_cartel").style.display = 'block';
}

function adjustBackgroundImage() {
    /* To re-center the background image after window-resizing. */

    document.getElementById("background_image").style.backgroundPosition = `${window.innerWidth-852}px center`;

}

function visualizeTheVisualizable() {

    const cached_runs = _.mapValues(localStorage, JSON.parse);       // because localStorage is the dict containing all the runs
    if (Object.keys(cached_runs).length != 0) {     // if there are experiments in the cache
        saveAndShowFile(cached_runs);
    } else {
        showLandingMessage();
        showBackgroundImage();
        buttonDivLoadMode();
    };

}