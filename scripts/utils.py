from brownie import (
    network,
    accounts,
    config,
    MockV3Aggregator,
    Contract,
    MockDAI,
    MockWeth,
)

from web3 import Web3

NON_FORKED_LOCAL_BLOCKCHAIN_ENVIRONEMNTS = [
    "hardhat", "development", "ganache"]
LOCAL_BLOCKCHAIN_ENVIRONMENTS = NON_FORKED_LOCAL_BLOCKCHAIN_ENVIRONEMNTS + [
    "mainnet-fork",
    "binance-fork",
    "matic-fork"
]

contract_to_mock = {
    "eth_usd_price_feed": MockV3Aggregator,
    "weth_token": MockWeth,
    "fau_token": MockDAI,
    "dai_usd_price_feed": MockV3Aggregator,
}

DECIMALS = 18
INITIAL_VALUE = Web3.toWei(2000, "ether")


def get_account(index=None, id=None):
    if index:
        return accounts[index]
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        return accounts[0]
    if id:
        return accounts.load(id)
    return accounts.add(config["wallets"]["from_key"])


def get_contract(contract_name):
    contract_type = contract_to_mock[contract_name]
    if network.show_active() in NON_FORKED_LOCAL_BLOCKCHAIN_ENVIRONEMNTS:
        if len(contract_type) <= 0:
            deploy_mocks()
        contract = contract_type[-1]
    else:
        try:
            contract_address = config["networks"][network.show_active(
            )][contract_name]
            contract = Contract.from_abi(
                contract_type._name, contract_address, contract_type.abi
            )
        except KeyError:
            print(
                f"{network.show_active()} address not found, perhaps you should add it to the config or deploy mocks?"
            )
            print(
                f"brownie run scripts/deploy_mocks.py --network {network.show_active()}"
            )
    return contract


def fund_with_link(
    contract_address, account=None, link_token=None, amount=1000000000000000000
):
    account = account if account else get_account()
    link_token = link_token if link_token else get_contract("link_token")
    tx = link_token.transfer(contract_address, amount, {"from": account})
    print("Funded {}".format(contract_address))
    return tx


def deploy_mocks(decimals=DECIMALS, initial_value=INITIAL_VALUE):
    print(f"The active network is {network.show_active()}")
    print("Deploying mocks...")
    account = get_account()
    print("Deploying Mock Price Feed...")
    mock_price_feed = MockV3Aggregator.deploy(
        decimals, initial_value, {"from": account})
    print(f"Deployed to {mock_price_feed.address}")

    print("Deploying Mock DAI...")
    dai_token = MockDAI.deploy({"from": account})
    print(f"Deployed to {dai_token.address}")
    print("Deploying Mock Weth")
    weth_token = MockWeth.deploy({"from": account})
    print(f"Deployed to {weth_token.address}")
