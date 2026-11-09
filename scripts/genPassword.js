

function genPassword() {

    let length = document.getElementById("charSlider").value;

    let characters = ''

    if (document.getElementById("lowerSwitch").checked == true) { characters += 'abcdefghijklmnopqrstuvwxyz'; }

    if (document.getElementById("upperSwitch").checked == true) { characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; }

    if (document.getElementById("numSwitch").checked == true) { characters += '1234567890'; }

    if (document.getElementById("specialSwitch").checked == true) { characters += '!@#$%^&*?'; }


    const charactersLength = characters.length;

    if (charactersLength == 0) { 
        document.getElementById("pass").innerHTML = "Error! Your password must contain at least type of character.";
        return;
    }

    let result = '';

    let randNums = new Uint32Array(1);


    for (let i = 0; i < length; i++) {

        self.crypto.getRandomValues(randNums);

        result += characters.charAt(randNums[0] % charactersLength);
    }

    document.getElementById("generatedPassword").innerText = result;
}
