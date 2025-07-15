import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SimpleStorage", (m) => {
    const name = m.getParameter("name", "SimpleStorage");

    const simpleStorage = m.contract("SimpleStorage", [name]);

    return {
        simpleStorage,
    };
});