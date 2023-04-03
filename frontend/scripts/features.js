function openNav() {
    /* Open the side menu */
    document.getElementById("experiments_area").style.width = "325px";
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
    const run_name_span = document.getElementById(`${run_name}_experiment_li_span`);
    const run_dict = JSON.parse( localStorage.getItem(run_name) );

    if (hide_button.innerHTML == "hide") {

        // Update the experiment list
        hide_button.innerHTML = "show";
        run_name_span.style.color = 'gray';
        run_name_span.style.backgroundColor = null;

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

    } else {    // if hide_button.innerHTML == "show"

        hide_button.innerHTML = "hide";
        run_name_span.style.color = 'black';
        run_name_span.style.backgroundColor = hexadecimal_dict[run_name]['background'];

        document.querySelectorAll(`.${run_name}_statistics`).forEach(node => node.style.display = 'block');

        Object.keys(run_dict).forEach(metric_name => {
            const chart = getChartObjectById(metric_name);
            const run_datasets = chart.data.datasets.filter((dataset) => dataset.label == run_name);
            run_datasets.forEach(dataset => {
                dataset.hidden = false;
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

function halfYMax(metric_name) {
    const chart = getChartObjectById(metric_name);
    chart.options.scales.y.max = chart.scales.y._range.max / 2;
    chart.update();
}

function resetChartZoom(metric_name) {
    const chart = getChartObjectById(metric_name);
    delete chart.options.scales;
    chart.update();
}

async function loadExamples() {

    // Clear the desk
    Object.keys(localStorage).forEach( run_name => {localStorage.removeItem(run_name);} );

    // Write the sample data on localStorage
    const sample_data = await fetch('./sample_data.json');
    const sample_data_json = await sample_data.json();
    Object.keys(sample_data_json).forEach(run_name => {
        saveRunToLocalStorage(run_name, sample_data_json[run_name]);
    });

    // Load app.html
    window.location.href = "app.html";

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