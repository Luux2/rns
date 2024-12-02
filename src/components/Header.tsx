import smashLogo from '../assets/SMASH-neg-udenby@4x.png'
import rnsLogo from '../assets/rns logo.png'
import kraftLogo from '../assets/Kraft-Biler-500x150-01.png'

const Header = () => {
    return (
        <div className="flex justify-between items-center relative mt-10 mb-10">
            <img src={smashLogo} alt="smashlogo" className="h-32"/>
            <img src={rnsLogo} alt="rnslogo" className="h-40 rounded-2xl absolute left-1/2 transform -translate-x-1/2"/>
            <img src={kraftLogo} alt="kraftlogo" className="h-20"/>
        </div>

    )
}
export default Header
