import './nav.css'
import {FaTwitter, FaInstagram, FaGithub} from 'react-icons/fa'
 
export default function Nav(){
    return (
        <>
        <div className="navbar">
            <span className="logo">MOODIFY</span>

            <ul className="links">
                <li><a href=""> <FaInstagram /> </a></li>
                <li><a href=""><FaTwitter /></a></li>
                <li><a href=""><FaGithub /></a></li>
            </ul>
        </div>
        </>
    )
}