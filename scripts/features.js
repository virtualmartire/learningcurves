const hexadecimal_dict = {
                            "original_palette": ["#fec600", "#954a97", "#e50064", "#009ee3", "#f39100", "#13a538", "#e3001f", "#0863b5"],
                            "palette_to_consume": ["#fec600", "#954a97", "#e50064", "#009ee3", "#f39100", "#13a538", "#e3001f", "#0863b5"]
                        }

const statistics_dict = {
                            "MAX": a => Math.max(...a),
                            "MIN": a => Math.min(...a)
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

    // Delete the item from the experiments list
    document.getElementById(run_name).remove();

    // Delete all run statistics
    deleteAllRunStatistics(run_name);

    // Delete the run from every chart
    deleteRunFromEveryChart(run_name);

    // Delete the run from localStorage
    localStorage.removeItem(run_name);

    // Restore the now-free color and reset the height of all the statistics div
    hexadecimal_dict.palette_to_consume.push(hexadecimal_dict[run_name]);
    delete hexadecimal_dict[run_name];
    resetDataDivHeight();

}

function hideRun(run_name) {

    var hide_button = document.getElementById(`${run_name}_hide_button`);
    var run_exp_list_item = document.getElementById(run_name);
    const run_dict = JSON.parse( localStorage.getItem(run_name) );
    const metrics_names_array = Object.keys(run_dict);

    if (hide_button.innerHTML == "hide") {

        // Update the experiment list
        hide_button.innerHTML = "show";
        run_exp_list_item.style.color = 'gray';

        // Delete all run statistics
        deleteAllRunStatistics(run_name);

        // Delete the run from every chart
        deleteRunFromEveryChart(run_name);

    } else {

        hide_button.innerHTML = "hide";
        run_exp_list_item.style.color = 'black';

        metrics_names_array.forEach((metric_name) => {
            const metric_data = run_dict[metric_name];
            drawCurve(metric_name, run_name, metric_data);
        });

    };

    resetDataDivHeight();

}

function clearDesk() {
    /* Delete all the saved data when the "clear" button is pressed. */

    Object.keys(localStorage).forEach(deleteRun);

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