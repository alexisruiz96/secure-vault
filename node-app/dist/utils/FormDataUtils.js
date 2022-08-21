"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAppendedFormData = void 0;
const checkAppendedFormData = (formData) => {
    for (let element of formData.entries()) {
        console.log(element[0] + ', ' + element[1]);
    }
};
exports.checkAppendedFormData = checkAppendedFormData;
//# sourceMappingURL=FormDataUtils.js.map