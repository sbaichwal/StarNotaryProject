const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    await instance.createStar('Awesome Star!', tokenId, {from: user1})
    assert.equal(await instance.lookUptokenIdToStarInfo(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('wow star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('wow star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.setApprovalForAll(user2, true, {from: user1, gasPrice: 0});
    assert.equal(await instance.ownerOf.call(starId), user1);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    let balanceAfterUser1SellStar = await web3.eth.getBalance(user1);
    assert.equal(await instance.ownerOf.call(starId), user2);
    let val = Number(balanceAfterUser1SellStar) - Number(balanceOfUser1BeforeTransaction);
    assert.equal(starPrice, val);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('wow star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.setApprovalForAll(user2, true, {from: user1});
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    let balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    assert.equal(await instance.ownerOf.call(starId), user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('wow star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.setApprovalForAll(user2, true, {from: user1});
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let name = "Test"
    let id = 1999
    await instance.createStar(name, id);
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(name, await instance.lookUptokenIdToStarInfo(id));

});


it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[2];
    let name = "Test1"
    let id = 2002
    await instance.createStar(name, id, {from: user1});
    assert.equal(user1, await instance.ownerOf(id));
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, id);
    // 3. Verify the star owner changed.
    assert.equal(user2, await instance.ownerOf(id));
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[2];
    let name = "Test2"
    let id = 2003
    await instance.createStar(name, id, {from: user1});
    // 2. Call your method lookUptokenIdToStarInfo
    assert.equal(name, await instance.lookUptokenIdToStarInfo(id));
    // 3. Verify if you Star name is the same
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[2];
    let name = "Test"
    let id = 2000
    let name2 = "Next Test"
    let id2 = 2001
    await instance.createStar(name, id, {from: user1});
    await instance.createStar(name2, id2, {from: user2});
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.setApprovalForAll(user2, true, {from: user1});
    await instance.setApprovalForAll(user1, true, {from: user2});
    await instance.exchangeStars(id, id2);
    // 3. Verify that the owners changed
    assert.equal(user2, await instance.ownerOf(id));
    assert.equal(user1, await instance.ownerOf(id2));
});