function gotFiles(input) {

    const file_list = input.files;

    for (let i = 0; i < file_list.length; i++) {

        const reader = new FileReader();
        reader.addEventListener("load", () => {     // because asynchrony
            localStorage.setItem(file.name, reader.result);
        });

        const file = file_list[i];
        reader.readAsText(file);
    };
}