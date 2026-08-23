function searchCalculators() {

    const input =
        document.getElementById("calculatorSearch");

    const searchTerm =
        input.value.toLowerCase().trim();

    const calculators =
        document.querySelectorAll(".tool-item");

    let found = 0;

    calculators.forEach(function(calculator) {

        const name =
            calculator.dataset.name.toLowerCase();

        if (
            searchTerm === "" ||
            name.includes(searchTerm)
        ) {

            calculator.style.display = "block";

            found++;

        } else {

            calculator.style.display = "none";

        }

    });

    document
        .getElementById("calculators")
        .scrollIntoView({
            behavior: "smooth"
        });
}


document
    .getElementById("calculatorSearch")
    .addEventListener("keyup", function(event) {

        if (event.key === "Enter") {
            searchCalculators();
        }

    });