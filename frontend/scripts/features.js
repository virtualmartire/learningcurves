function openNav() {
    /* Open the side menu */
    document.getElementById("experiments_area").style.width = "300px";
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

function hideRun(run_name) {
    /* The action triggered by the hide buttons. */

    const hide_button = document.getElementById(`${run_name}_hide_button`);
    const run_exp_list_item = document.getElementById(`${run_name}_experiment_li`);
    const run_dict = JSON.parse( localStorage.getItem(run_name) );

    if (hide_button.innerHTML == "hide") {

        // Update the experiment list
        hide_button.innerHTML = "show";
        run_exp_list_item.style.color = 'gray';

        // Hide all run statistics
        document.querySelectorAll(`.${run_name}_statistics`).forEach(node => node.style.display = 'none');

        // Hide the run from every chart
        Object.keys(run_dict).forEach(metric_name => {
            const chart = getChartObjectById(metric_name);
            const run_datasets = chart.data.datasets.filter((dataset) => dataset.label == run_name);
            run_datasets.forEach(dataset => {
                dataset.hidden = true;
            });
            chart.update();
        });

    } else {

        hide_button.innerHTML = "hide";
        run_exp_list_item.style.color = 'black';

        document.querySelectorAll(`.${run_name}_statistics`).forEach(node => node.style.display = 'block');

        Object.keys(run_dict).forEach(metric_name => {
            const chart = getChartObjectById(metric_name);
            const run_datasets = chart.data.datasets.filter((dataset) => dataset.label == run_name);
            run_datasets.forEach(dataset => {
                dataset.hidden = !(chart.math_version == dataset.math_version);
            });
            chart.update();
        });

    };

    resetDataDivHeight();

}

function clearDesk() {
    /* Delete all the saved data when the "clear" button is pressed. */

    Object.keys(localStorage).forEach(deleteRun);

}

function exportDesk() {
    /* The action triggered by the export button. */

    const cached_runs = _.mapValues(localStorage, JSON.parse);
    const link = document.createElement('a');
    var date = new Date();

    date = date.toLocaleDateString().replace(/\//g, '_');
    link.setAttribute('download', `learningcurves_${date}_.json`);
    link.href = makeTextFile(JSON.stringify(cached_runs));
    document.body.appendChild(link);

    window.requestAnimationFrame(function () {
        const event = new MouseEvent('click');
        link.dispatchEvent(event);
        document.body.removeChild(link);
    });

}

function derivativesValuesSwitch(metric_name) {
    /* The action triggered when a derivatives/values button is pressed. */

    const switch_button = document.getElementById(`${metric_name}_switch_button`);
    const chart = getChartObjectById(metric_name);

    // Change the cart mode
    chart.math_version = (switch_button.innerHTML == "derivatives") ? "derivatives": "values";

    // Change the button aspect
    switch_button.innerHTML = (switch_button.innerHTML == "derivatives") ? "values" : "derivatives";

    // Switch the curves visibility, restore the default zoom and update the chart
    chart.data.datasets.forEach(dataset => {
        const hide_button = document.getElementById(`${dataset.label}_hide_button`);
        if (hide_button.innerHTML == "hide") {      // if the run is visible
            dataset.hidden = !(dataset.math_version == chart.math_version);
        };
    });
    delete chart.options.scales.y.max;
    delete chart.options.scales.y.min;
    chart.update();

    // Compute and add the new statistics (this has to be the final step)
    chart.data.datasets.filter(dataset => !dataset.hidden)
        .forEach(dataset => computeAndAddStatistics(metric_name, dataset.label));

}

function halfYMax(metric_name) {
    const chart = getChartObjectById(metric_name);
    chart.options.scales.y.max = chart.scales.y._range.max / 2;
    chart.update();
}

function doubleYMax(metric_name) {
    const chart = getChartObjectById(metric_name);
    chart.options.scales.y.max = chart.scales.y._range.max * 2;
    chart.update();
}

function halfYMin(metric_name) {
    const chart = getChartObjectById(metric_name);
    chart.options.scales.y.min = chart.scales.y._range.min / 2;
    chart.update();
}

function doubleYMin(metric_name) {
    const chart = getChartObjectById(metric_name);
    chart.options.scales.y.min = chart.scales.y._range.min * 2;
    chart.update();
}