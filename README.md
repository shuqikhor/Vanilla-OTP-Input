# OTP-Input-Group
A simple Vanilla JS widget for OTP input

## Usage
1. In HTML, create a container block, and place some text or number `<input>` in it according to the length of your OTP:
```html
<!-- 6 digits = 6 inputs -->
<div id="otp-input">
  <input>
  <input>
  <input>
  <input>
  <input>
  <input>
</div>
```
3. Initiate by passing a selector of the container, or the container element itself, to the constructor:
```js
let OTPInputBySelector = new OTPInputGroup("#otp-input1");
let OTPInputByElement = new OTPInputGroup(document.querySelector("#otp-input2"));
```
4. You could keep it in sync with a hidden input if you want:
```js
const OTPContainer = document.querySelector("#otp-input");
const OTPHiddenInput = document.querySelector("input[name=otp]");

let OTPInput = new OTPInputGroup(OTPContainer, OTPHiddenInput);
// now the hidden input will always have the concatted value
```
5. Use `.getValue()` if you need the concatted value programmatically:
```js
let otp = OTPInput.getValue();
```
