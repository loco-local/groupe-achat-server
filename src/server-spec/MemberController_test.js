const seeder = require("../seed/seeder");

describe('MemberController', () => {
    beforeEach(() => {
        return seeder.run();
    });
    it("true", async () => {
        "1".should.equal("1")
    });
});
