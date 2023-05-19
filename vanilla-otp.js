"use strict";

var VanillaOTP = function (elementOrSelector, updateToInput = null) {
	// set default options
	this.emptyChar = " ";

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

	this.inputs = Array.from(this.container.querySelectorAll("input[type=text], input[type=number], input[type=password]"));
	
	let instance = this;
	let inputCount = instance.inputs.length;

	for (let i = 0; i < inputCount; i++) {
		let input = instance.inputs[i];
		input.addEventListener("input", function () {
			// if not number, restore value
			if (isNaN(input.value)) {
				input.value = input.dataset.otpInputRestore || "";
				return instance._updateValue();
			}

			// if a character is removed, do nothing and save
			if (input.value.length == 0) {
				return instance._saveInputValue(i);
			}

			// if single character, save the value and go to next input (if any)
			if (input.value.length == 1) {
				instance._saveInputValue(i);
				instance._updateValue();
				if (i+1 < inputCount) instance.inputs[i+1].focus();
				return;
			}

			// more multiple character entered (eg. pasted),
			// and it's the last input of the row,
			// truncate to single character and save
			if (i == inputCount - 1) {
				return instance._setInputValue(i, input.value);
			}

			// otherwise, put each character to each of the next input
			let chars = input.value.split('');

			for (let pos = 0; pos < chars.length; pos++) {
				// if length exceeded the number of inputs, stop
				if (pos + i >= inputCount) break;

				// paste value and save
				instance._setInputValue(pos + i, chars[pos]);
			}

			// focus the input next to the last pasted character
			let focus_index = Math.min(inputCount - 1, i + chars.length);
			instance.inputs[focus_index].focus();
		});

		input.addEventListener("keydown", function (e) {
			// backspace button
			if (e.keyCode == 8 && input.value == '' && i != 0) {
				instance._setInputValue(i - 1, '');
				instance.inputs[i-1].focus();
				return;
			}

			// delete button
			if (e.keyCode == 46 && i != inputCount - 1) {
				let selectionStart = input.selectionStart || 0;

				for (let pos = i + selectionStart; pos < inputCount - 1; pos++) {
					instance._setInputValue(pos, instance.inputs[pos + 1].value);
				}

				instance._setInputValue(inputCount - 1, '');

				// restore caret
				if (input.selectionStart) input.selectionStart = selectionStart;
				e.preventDefault();
				return;
			}

			// left button
			if (e.keyCode == 37 && (input.selectionStart == null || input.selectionStart == 0)) {
				if (i > 0) {
					e.preventDefault();
					instance.inputs[i-1].focus();
					instance.inputs[i-1].select();
				}
				return;
			}

			// right button
			if (e.keyCode == 39 && (input.selectionStart == null || input.selectionEnd == input.value.length)) {
				if (i+1 < inputCount) {
					e.preventDefault();
					instance.inputs[i+1].focus();
					instance.inputs[i+1].select();
				}
				return;
			}
		});
	}
};

VanillaOTP.prototype.setEmptyChar = function (char) {
	this.emptyChar = char;
}

VanillaOTP.prototype.getValue = function () {
	let value = '';
	let instance = this;
	this.inputs.forEach(function (input) {
		value += (input.value == '') ? instance.emptyChar : input.value;
	});
	return value;
};

VanillaOTP.prototype.setValue = function (value) {
	if (isNaN(value)) {
		console.error("Please enter an integer value.");
		return;
	}

	value = "" + value;
	let chars = value.split("");
	for (let i = 0; i < this.inputs.length; i++) {
		this._setInputValue(i, chars[i] || "");
	}
}

VanillaOTP.prototype._setInputValue = function (index, value) {
	if (isNaN(value)) {
		return console.error("Please enter an integer value.");
	}

	if (!this.inputs[index]) {
		return console.error("Index not found.");
	}

	this.inputs[index].value = String(value).substring(0, 1);
	this._saveInputValue(index);
	this._updateValue();
	return;
}

VanillaOTP.prototype._saveInputValue = function (index, value) {
	if (!this.inputs[index]) {
		return console.error("Index not found.");
	}

	this.inputs[index].dataset.otpInputRestore = value || this.inputs[index].value;
}

VanillaOTP.prototype._updateValue = function () {
	if (this.updateTo) this.updateTo.value = this.getValue();
};