"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.types = void 0;
const types = /* GraphQL */ `
type Query {
  hello: String 
}
`;
exports.types = types;
const resolvers = {
    Query: {
        hello: () => 'Hello, Kretes'
    }
};
exports.resolvers = resolvers;
//# sourceMappingURL=index.js.map