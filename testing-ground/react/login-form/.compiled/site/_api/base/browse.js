"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.browse = void 0;
const kretes_1 = require("kretes");
const { OK } = kretes_1.response;
const Cities = [
    { city: 'New York City', ip: '11.11.0.11' },
    { city: 'Paris', ip: '22.22.0.22' },
    { city: 'Warsaw', ip: '33.33.0.33' }
];
const browse = ({ params }) => {
    const cityAtRandom = Cities[Math.floor(Math.random() * Cities.length)];
    return OK(cityAtRandom);
};
exports.browse = browse;
//# sourceMappingURL=browse.js.map