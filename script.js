class Calculator {
    constructor(previousOperationText, currentOperationText) {
        this.previousOperationText = previousOperationText;
        this.currentOperationText = currentOperationText;
        this.currentOperation = "";
        this.operations = [];
        this.resultShown = false; // Flag to track if result is already shown
    }

    addDigit(digit) {
        if (digit === "." && this.currentOperation.includes(".")) {
            return;
        }
        this.currentOperation += digit;
        this.updateScreen();
    }

    processOperation(operation) {
        if (operation === "=") {
            this.calculateResult();
            return;
        }

        // Clear current operation text when a new operation is started
        if (this.resultShown) {
            this.currentOperation = "";
            this.resultShown = false;
        }

        if (operation === "C") {
            this.processClearOperation();
            return;
        }

        if (operation === "CE") {
            this.processClearCurrentOperation();
            return;
        }

        if (operation === "DEL") {
            this.processDelOperator();
            return;
        }

        if (operation === "%") {
            this.processPercentageOperation();
            return;
        }

        // Store the current operation and operand in the operations array
        if (this.currentOperation !== "") {
            this.operations.push(this.currentOperation);
            this.currentOperation = "";
        }

        this.operations.push(operation);

        this.updateScreen();
    }

    updateScreen() {
        this.currentOperationText.innerText = this.currentOperation;
        this.previousOperationText.innerText = this.operations.join(" ");
    }

    calculateResult() {
        if (this.operations.length < 2) {
            return; // Not enough data to calculate
        }

        // Store the final operand if currentOperation is not empty
        if (this.currentOperation !== "") {
            this.operations.push(this.currentOperation);
            this.currentOperation = "";
        }

        // Convert the infix expression to postfix (RPN) using Shunting Yard Algorithm
        const outputQueue = [];
        const operatorStack = [];
        const precedence = {
            "+": 1,
            "-": 1,
            "×": 2,
            "÷": 2
        };

        this.operations.forEach(token => {
            if (!isNaN(token)) {
                outputQueue.push(token);
            } else {
                while (operatorStack.length &&
                       precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(token);
            }
        });

        while (operatorStack.length) {
            outputQueue.push(operatorStack.pop());
        }

        // Evaluate the postfix expression
        const stack = [];
        outputQueue.forEach(token => {
            if (!isNaN(token)) {
                stack.push(parseFloat(token));
            } else {
                const b = stack.pop();
                const a = stack.pop();
                switch (token) {
                    case "+":
                        stack.push(a + b);
                        break;
                    case "-":
                        stack.push(a - b);
                        break;
                    case "×":
                        stack.push(a * b);
                        break;
                    case "÷":
                        stack.push(a / b);
                        break;
                }
            }
        });

        const result = stack[0];

        // Update the screen with the final result
        this.currentOperationText.innerText = result;
        this.previousOperationText.innerText = "";
        this.operations = []; // Clear stored operations for the next calculation
        this.resultShown = true; // Set result shown flag to true
    }

    processDelOperator() {
        this.currentOperation = this.currentOperation.slice(0, -1);
        this.updateScreen();
    }

    processPercentageOperation() {
        if (this.currentOperation !== "") {
            const percentageValue = +this.currentOperation / 100;
            this.currentOperation = percentageValue.toString();
            this.updateScreen();
        }
    }

    processClearCurrentOperation() {
        this.currentOperation = "";
        this.updateScreen();
    }

    processClearOperation() {
        this.currentOperation = "";
        this.previousOperationText.innerText = "";
        this.operations = [];
        this.updateScreen();
    }
}

const previousOperationText = document.querySelector("#previous-operation");
const currentOperationText = document.querySelector("#current-operation");
const buttons = document.querySelectorAll("#buttons-container button");

const calc = new Calculator(previousOperationText, currentOperationText);

buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        const value = e.target.innerText;
        if (+value >= 0 || value === ".") {
            calc.addDigit(value);
        } else {
            calc.processOperation(value);
        }
    });
});
