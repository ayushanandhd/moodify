import './nav.css'
import {FaTwitter, FaInstagram, FaGithub} from 'react-icons/fa'
 
export default function Nav(){
    return (
        <>
        <div className="navbar">
            <span className="logo">MOODIFY</span>

            <ul className="links">
                <li><a target='_blank' href="https://instagram.com/ayushanandhd"> <FaInstagram /> </a></li>
                <li><a target='_blank' href="https://x.com/ayushanandhd"><FaTwitter /></a></li>
                <li><a target='_blank' href="https://github.com/ayushanandhd/moodify"><FaGithub /></a></li>
            </ul>
        </div>
        </>
    )
}