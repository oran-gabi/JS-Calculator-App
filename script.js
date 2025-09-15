document.addEventListener('DOMContentLoaded', () => {
    // Select HTML elements to work with, like the display, buttons, and history log.
    const display = document.querySelector('.display');
    const mainButtons = document.querySelector('.buttons');
    const moreOpsDashboard = document.querySelector('.more-ops-dashboard');
    const historyLog = document.getElementById('history-log');

    // Initialize the calculator's state variables.
    let currentInput = '0'; // The number currently shown on the display.
    let operator = null; // The operator chosen (+, -, *, /).
    let firstOperand = null; // The first number in the operation.
    let waitingForSecondOperand = false; // A flag to clear the display for the next number.
    let history = []; // An array to store calculation history.

    // A core function that performs basic arithmetic calculations.
    function calculate(a, op, b) {
        a = parseFloat(a); // Convert strings to numbers.
        b = parseFloat(b);
        if (isNaN(a) || isNaN(b)) return null; // Handle invalid number inputs.

        // Use a switch statement to perform the correct operation.
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/':
                if (b === 0) {
                    return 'Error: Div by 0'; // Prevent division by zero.
                }
                return a / b;
            default: return b; // Default case if no operator is set.
        }
    }

    // A function to update the calculator's display with formatting.
    function updateDisplay() {
        try {
            // Check if the current input is a valid number and not infinity.
            if (!isNaN(parseFloat(currentInput)) && isFinite(currentInput)) {
                let formattedNumber = parseFloat(currentInput);
                // Limit decimals to 6 places and remove unnecessary trailing zeros.
                display.textContent = formattedNumber.toLocaleString('en-US', { maximumFractionDigits: 6 });
            } else {
                // If the input is an error message, display it directly.
                display.textContent = currentInput;
            }
        } catch (e) {
            // Fallback for any unexpected errors.
            display.textContent = currentInput;
        }
    }

    // A function to add an operation to the history log.
    function updateHistory(operation) {
        history.push(operation); // Add the operation string to the history array.
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        historyItem.innerHTML = operation;
        historyLog.appendChild(historyItem); // Add the new item to the history section.
        historyLog.scrollTop = historyLog.scrollHeight; // Auto-scroll to show the latest entry.
    }

    // Add event listeners to the main calculator buttons.
    mainButtons.addEventListener('click', (event) => {
        const button = event.target.closest('.btn'); // Find the button that was clicked.
        if (!button) return; // Exit if no button was clicked.

        const buttonValue = button.textContent;

        // Logic for the Clear (AC) button.
        if (button.classList.contains('btn-clear')) {
            // Reset all state variables to their initial values.
            currentInput = '0';
            operator = null;
            firstOperand = null;
            waitingForSecondOperand = false;
            history = [];
            historyLog.innerHTML = '';
            updateDisplay();
            return;
        }

        // Logic for the Delete (DEL) button.
        if (button.classList.contains('btn-del')) {
            currentInput = currentInput.slice(0, -1); // Remove the last character.
            // If the display is empty or only a minus sign, reset to '0'.
            if (currentInput === '' || currentInput === '-') {
                currentInput = '0';
            }
            updateDisplay();
            return;
        }

        // Logic for the Sign (+/-) button.
        if (button.classList.contains('btn-toggle-sign')) {
            if (currentInput !== '0') {
                currentInput = (parseFloat(currentInput) * -1).toString(); // Multiply by -1 to flip the sign.
                updateDisplay();
            }
            return;
        }

        // Logic for the Percent (%) button.
        if (button.classList.contains('btn-percent')) {
            if (currentInput !== '0') {
                currentInput = (parseFloat(currentInput) / 100).toString(); // Divide by 100.
                updateDisplay();
            }
            return;
        }

        // Logic for basic mathematical operators (+, -, *, /).
        if (button.classList.contains('btn-math')) {
            // Store the first operand if it's the beginning of a new calculation.
            if (firstOperand === null) {
                firstOperand = parseFloat(currentInput);
            } else if (operator) {
                // If a calculation is already in progress, perform it.
                const result = calculate(firstOperand, operator, currentInput);
                if (typeof result === 'string') {
                    currentInput = result; // Handle error messages.
                } else {
                    updateHistory(`${firstOperand} ${operator} ${currentInput} = ${result}`); // Update history.
                    currentInput = result;
                    firstOperand = result; // The new first operand is the result.
                }
            }
            waitingForSecondOperand = true; // Set flag to clear display for the next number.
            operator = buttonValue; // Store the new operator.
            updateDisplay();
            return;
        }

        // Logic for the Equals (=) button.
        if (button.classList.contains('btn-equal')) {
            if (operator && firstOperand !== null) {
                // Perform the final calculation and update the display and history.
                const result = calculate(firstOperand, operator, currentInput);
                if (typeof result === 'string') {
                    currentInput = result;
                } else {
                    updateHistory(`${firstOperand} ${operator} ${currentInput} = ${result}`);
                    currentInput = result;
                }
                // Reset state variables for a new calculation.
                operator = null;
                firstOperand = null;
                waitingForSecondOperand = true;
                updateDisplay();
            }
            return;
        }

        // Logic for the 'More Operations' button.
        if (button.classList.contains('btn-more-ops')) {
            moreOpsDashboard.classList.toggle('hidden'); // Toggle visibility of the advanced dashboard.
            return;
        }
        
        // Handle number and decimal point input.
        if (currentInput === '0' || waitingForSecondOperand) {
            currentInput = buttonValue; // Start a new number.
            waitingForSecondOperand = false;
        } else {
            currentInput += buttonValue; // Append the new digit.
        }
        updateDisplay();
    });

    // Add an event listener for the advanced dashboard buttons.
    moreOpsDashboard.addEventListener('click', (event) => {
        const button = event.target.closest('.btn');
        if (!button) return;

        let num = parseFloat(currentInput); // Get the number from the display.

        // Logic for the inverse (1/x) button.
        if (button.classList.contains('btn-inverse')) {
            if (num !== 0) {
                let result = 1 / num;
                updateHistory(`1/${num} = ${result}`);
                currentInput = result.toString();
                updateDisplay();
            } else {
                currentInput = 'Error: Div by 0';
                updateDisplay();
            }
            waitingForSecondOperand = true;
        }
        
        // Logic for the square root (√) button.
        if (button.classList.contains('btn-sqrt')) {
            if (num >= 0) {
                let result = Math.sqrt(num);
                updateHistory(`√${num} = ${result}`);
                currentInput = result.toString();
                updateDisplay();
            } else {
                currentInput = 'Error'; // Handle square root of a negative number.
                updateDisplay();
            }
            waitingForSecondOperand = true;
        }

        // Logic for the square (x²) button.
        if (button.classList.contains('btn-square')) {
            let result = num * num;
            updateHistory(`${num}² = ${result}`);
            currentInput = result.toString();
            updateDisplay();
            waitingForSecondOperand = true;
        }

        // Logic for trigonometric functions (sin, cos, tan).
        // The numbers are converted to radians because JS trig functions use radians.
        if (button.textContent === 'sin') {
            let result = Math.sin(num * Math.PI / 180); 
            updateHistory(`sin(${num}) = ${result}`);
            currentInput = result.toString();
            updateDisplay();
            waitingForSecondOperand = true;
        }
        
        if (button.textContent === 'cos') {
            let result = Math.cos(num * Math.PI / 180);
            updateHistory(`cos(${num}) = ${result}`);
            currentInput = result.toString();
            updateDisplay();
            waitingForSecondOperand = true;
        }
        
        if (button.textContent === 'tan') {
            let result = Math.tan(num * Math.PI / 180);
            updateHistory(`tan(${num}) = ${result}`);
            currentInput = result.toString();
            updateDisplay();
            waitingForSecondOperand = true;
        }
    });
});