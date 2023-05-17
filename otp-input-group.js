"use strict";

var OTPInputGroup = function (elementOrSelector, updateToInput = null) {
	if (typeof elementOrSelector === 'string') {
		this.container = document.querySelector(elementOrSelector);
	} else if (elementOrSelector instanceof Element) {
		this.container = elementOrSelector;
	} else {
		return;
	}

	if (updateToInput) {
		if (typeof updateToInput === 'string') {
			this.updateTo = document.querySelector(updateToInput) || null;
		} else if (updateToInput instanceof Element) {
			this.updateTo = updateToInput;
		} else {
			this.updateTo = null;
		}
	}

	this.inputs = Array.from(this.container.querySelectorAll("input[type=text], input[type=number]"));
	
	let instance = this;
	let inputCount = instance.inputs.length;

	for (let i = 0; i < inputCount; i++) {
		let input = instance.inputs[i];
		input.addEventListener("input", function () {
			// if not number, restore value
			if (isNaN(input.value)) {
				input.value = input.dataset.otpInputRestore || "";
				return instance.updateValue();
			}

			// if single character, save the value and go to next input (if any)
			if (input.value.length == 1) {
				input.dataset.otpInputRestore = input.value;
				if (i+1 < inputCount) instance.inputs[i+1].focus();
				return instance.updateValue();
			}

			if (input.value.length == 0) {
				input.dataset.otpInputRestore = '';
				return instance.updateValue();
			}

			// more multiple character entered (eg. pasted),
			// and it's the last input of the row,
			// truncate to single character and save
			if (i == inputCount - 1) {
				input.value = input.value.substring(0, 1);
				input.dataset.otpInputRestore = input.value;
				return instance.updateValue();
			}

			// otherwise, put each character to each of the next input
			let chars = input.value.split('');

			for (let pos = 0; pos < chars.length; pos++) {
				// if length exceeded the number of inputs, stop
				if (pos + i >= inputCount) break;

				// paste value and save
				let targetInput = instance.inputs[pos + i];
				targetInput.value = chars[pos];
				targetInput.dataset.otpInputRestore = chars[pos];
			}

			// focus the input next to the last pasted character
			let focus_index = Math.min(inputCount - 1, i + chars.length);
			instance.inputs[focus_index].focus();
		});

		input.addEventListener("keydown", function (e) {
			// backspace button
			if (e.keyCode == 8 && input.value == '' && i != 0) {
				instance.inputs[i-1].value = '';
				instance.inputs[i-1].focus();
				return instance.updateValue();
			}

			// delete button
			if (e.keyCode == 46 && i != inputCount - 1) {
				let selectionStart = input.selectionStart;

				for (let pos = i + selectionStart; pos < inputCount - 1; pos++) {
					instance.inputs[pos].value = instance.inputs[pos + 1].value;
					instance.inputs[pos].dataset.otpInputRestore = instance.inputs[pos].value;
				}

				instance.inputs[inputCount - 1].value = '';
				instance.inputs[inputCount - 1].dataset.otpInputRestore = '';

				// restore caret
				input.selectionStart = selectionStart;
				e.preventDefault();
				return instance.updateValue();
			}

			// left button
			if (e.keyCode == 37 && input.selectionStart == 0) {
				if (i > 0) {
					e.preventDefault();
					instance.inputs[i-1].focus();
					instance.inputs[i-1].select();
				}
				return instance.updateValue();
			}

			// right button
			if (e.keyCode == 39 && input.selectionEnd == input.value.length) {
				if (i+1 < inputCount) {
					e.preventDefault();
					instance.inputs[i+1].focus();
					instance.inputs[i+1].select();
				}
				return instance.updateValue();
			}
		});
	}
};

OTPInputGroup.prototype.updateValue = function () {
	if (this.updateTo) this.updateTo.value = this.getValue();
};

OTPInputGroup.prototype.getValue = function () {
	let value = '';
	this.inputs.forEach(function (input) {
		if (input.value == '') {
			value += ' ';
		} else {
			value += input.value;
		}
	});
	return value;
};