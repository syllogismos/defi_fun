
import { useEthers, useContractFunction } from '@usedapp/core'
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import networkMapping from "../chain-info/deployments/map.json"
import { constants, utils } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import ERC20 from "../chain-info/contracts/MockERC20.json"
import { useEffect, useState } from 'react'

export const useStakeTokens = (tokenAddress: string) => {
    const { chainId } = useEthers()
    const { abi } = TokenFarm
    // const dappTokenAddress = chainId ? networkMapping[String(chainId)]["DappToken"][0] : constants.AddressZero
    const tokenFarmAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero
    const tokenFarmInterface = new utils.Interface(abi)
    const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface)

    const erc20abi = ERC20.abi
    const erc20Interface = new utils.Interface(erc20abi)
    const erc20Contract = new Contract(tokenAddress, erc20Interface)

    const { send: approveERC20Send, state: approveERC20State } =
        useContractFunction(erc20Contract, "approve", {
            transactionName: "Approve ERC20 Transfer"
        })

    const approveAndStake = (amount: string) => {
        setAmountStake(amount)
        return approveERC20Send(tokenFarmAddress, amount)
    }

    const { send: stakeSend, state: stakeState } =
        useContractFunction(tokenFarmContract, "stakeTokens", {
            transactionName: "Stake Tokens"
        })

    const [amountToStake, setAmountStake] = useState("0")

    useEffect(() => {
        if (approveERC20State.status === "Success") {
            stakeSend(amountToStake, tokenAddress)
        }
    }, [approveERC20State, tokenAddress, amountToStake])

    const [state, setState] = useState(approveERC20State)

    useEffect(() => {
        if (approveERC20State.status === "Success") {
            setState(stakeState)
        } else {
            setState(approveERC20State)
        }
    }, [approveERC20State, stakeState])

    return { approveAndStake, state }

}