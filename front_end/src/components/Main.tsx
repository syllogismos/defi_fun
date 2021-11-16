
import { useEthers } from '@usedapp/core'
import helperConfig from "../helper-config.json"
import networkMapping from "../chain-info/deployments/map.json"
import brownieConfig from "../brownie-config.json"
import { constants } from 'ethers'
import pug from '../pug.png'
import { YourWallet } from './yourWallet'
import { makeStyles } from '@material-ui/core'


const useStyles = makeStyles(theme => ({
    title: {
        color: theme.palette.common.white,
        textAlign: "center",
        padding: theme.spacing(4)
    }
}))

export const Main = () => {

    const classes = useStyles()

    const { chainId, error } = useEthers()
    const networkName = chainId ? helperConfig[chainId] : "dev"
    console.log(chainId)
    console.log(networkName)
    const dappTokenAddress = chainId ? networkMapping[String(chainId)]["DappToken"][0] : constants.AddressZero
    const wethTokenAddress = chainId ? brownieConfig["networks"][networkName]["weth_token"] : constants.AddressZero
    const fauTokenAddress = chainId ? brownieConfig["networks"][networkName]["fau_token"] : constants.AddressZero
    console.log(dappTokenAddress)
    console.log(wethTokenAddress)
    console.log(fauTokenAddress)
    const supportedTokens: Array<Token> = [
        { image: pug, address: dappTokenAddress, name: "DAPP" },
        { image: pug, address: wethTokenAddress, name: "WETH" },
        { image: pug, address: fauTokenAddress, name: "FAU" }

    ]
    return (
        <>
            <h2 className={classes.title}>Dapp Token App</h2>
            <YourWallet supportedTokens={supportedTokens} />
        </>)
}

export type Token = {
    image: string
    address: string
    name: string
}