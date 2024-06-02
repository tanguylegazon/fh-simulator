function NumberOfPhone(props) {
    return (
        <div className="password-length">
            <label htmlFor="pw-length" className="visually-hidden">Taille du mot de passe</label>
            <button id="pw-length-decrease">−</button>
            <input id="pw-length" inputMode="numeric" value="16"
                   onInput="this.value = this.value.replace(/\D+/g, '')"/>
            <button id="pw-length-increase">+</button>
        </div>
    );
}

export default NumberOfPhone;