const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (n) => {
    //converts ether value to wei
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token', ()=> {
  let   token,
        accounts,
        deployer,
        receiver,
        exchange

    // runs before each
    beforeEach(async() => {
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Oxonomi', 'OXO', '1000000')

        accounts =  await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
        exchange = accounts[2]
        tester = accounts[3]
    })

  //Describe Deployment
    describe('Deployment', () => {
        const name = 'Oxonomi'
        const symbol = 'OXO'
        const decimals = '18'
        const totalSupply = tokens('1000000')

        it('has correct name', async ()=> {
            expect(await token.name()).to.equal(name)
        })

        it('has correct symbol', async ()=> {
            expect(await token.symbol()).to.equal(symbol)
        })

        it('has correct decimals', async ()=> {
            expect(await token.decimals()).to.equal(decimals)
        })

        it('has correct total supply', async ()=> {
            expect(await token.totalSupply()).to.equal(totalSupply)
        })

        it('assigns total supply to deployer', async ()=> {
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
        })
    })


    describe('Sending Tokens', () => {
        let amount, transaction, result

        describe('Success', () => {

            beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).transfer(receiver.address, amount)
                result = await transaction.wait();
            })
            it('transfer balances', async ()=> {
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
            })
            it('emits a Transfer event', async ()=> {
                let events = result.events[0];
                expect(events.event).to.equal('Transfer');

                const args = events.args
                expect (args.from).to.equal(deployer.address)
                expect (args.to).to.equal(receiver.address)
                expect (args.value).to.equal(amount)
            })
        })

        describe('Failure', () => {
            it('rejects innsufficient balances', async () => {
                const invalidAmount = tokens(1000000000000)
                await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted

            })
            it('rejects invalid recipent', async () => {
                const amount = tokens(100)
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })
    })


    describe('Approving Tokens', () => {
        let amount, transaction, result

        beforeEach(async () => {
            amount = tokens(100)
            transaction = await token.connect(deployer).approve(exchange.address, amount)
            // delpoyer approves exchange address to 100
            result = await transaction.wait()
        })

        describe('Success', () => {
            it('allocates an allowance for delegated token spending', async () => {
            expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
            })

            it('emits an Approval event', async ()=> {
                let events = result.events[0];
                expect(events.event).to.equal('Approval');

                const args = events.args
                expect (args.owner).to.equal(deployer.address)
                expect (args.spender).to.equal(exchange.address)
                expect (args.value).to.equal(amount)

            })
        })

        describe('Failure', () => {
            it('rejects invalid spender', async () => {
                await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })

    })

    describe('Delegated Token Transfers', () => {
        let amount, transaction, result

        beforeEach(async () => {
            amount = tokens(100)
            transaction = await token.connect(deployer).approve(exchange.address, amount)
            result = await transaction.wait()
        })


        describe('Success', () => {
            beforeEach(async () => {
                transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount)
                result = await transaction.wait()
            })
            it('transfers token balances', async () => {
                expect(await token.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits("999900", "ether"))
                expect(await token.balanceOf(receiver.address)).to.be.equal(amount)
            })
            it('resets the allowance', async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(0)

            })
            it('emits a Transfer event', async ()=> {
                let events = result.events[0];
                expect(events.event).to.equal('Transfer');

                const args = events.args
                expect (args.from).to.equal(deployer.address)
                expect (args.to).to.equal(receiver.address)
                expect (args.value).to.equal(amount)
            })

        })

        describe('Failure', async () => {
            //Attempt to transfer too many tokens
            const invalidAmount = tokens(1000000000) // greater than total supply
            await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
        })

    })


    describe('Faucet', () => {
        let transaction

        beforeEach(async () => {
            transaction = await token.connect(tester).faucet()
            result = await transaction.wait()
        })

        describe('Success', () => {
            it('emits successful Faucet event', async ()=> {
                let events = result.events[1]; // because [0] is the _transfer event
                expect(events.event).to.equal('Faucet');
            })
        })

        describe('Failure', () => {
            it(' rejects multiple calls from the same user', async ()=> {
                await expect(token.connect(tester).faucet()).to.be.reverted
            })
        })

    })

})
