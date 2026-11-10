function normalizePass(pass) {
  return pass
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t");
}

function evaluatePass(oPass) {

    let rating;
    let score = 0;

    pass = normalizePass(oPass)

    let rec = document.getElementById("recs");

    rec.innerHTML = "";

   
    if (pass.length >= 8) { score += ((pass.length - 4) / 2) * 5 }
    else { rec.innerHTML += "- Increase password length"; rec.innerHTML += '<br>'; }


    if ( /[A-Z]/.test(oPass) ) { score += 15 }
    else { rec.innerHTML += "- Add uppercase character(s) to password"; rec.innerHTML += '<br>'; }


    if ( /[0-9]/.test(oPass) ) { score += 15 }
    else { rec.innerHTML += "- Add numbers to password"; rec.innerHTML += '<br>'; }

    if ( /\W/.test(oPass) ) { score += 30 }
    else { rec.innerHTML += "- Add special characters to password (ex: $, %, *)"; rec.innerHTML += '<br>'; }


    let cPass = "123456,password,12345678,1234,pussy,12345,dragon,qwerty,696969,mustang,letmein,baseball,master,michael,football,shadow,monkey,abc123,pass,fuckme,6969,jordan,harley,ranger,iwantu,jennifer,hunter,fuck,2000,test,batman,trustno1,thomas,tigger,robert,access,love,buster,1234567,soccer,hockey,killer,george,sexy,andrew,charlie,superman,asshole,fuckyou,dallas,jessica,panties,pepper,1111,austin,william,daniel,golfer,summer,heather,hammer,yankees,joshua,maggie,biteme,enter,ashley,thunder,cowboy,silver,richard,fucker,orange,merlin,michelle,corvette,bigdog,cheese,matthew,121212,patrick,martin,freedom,ginger,blowjob,nicole,sparky,yellow,camaro,secret,dick,falcon,taylor,111111,131313,123123,bitch,hello,scooter,please,porsche,guitar,chelsea,black,diamond,nascar,jackson,cameron,654321,computer,amanda,wizard,xxxxxxxx,money,phoenix,mickey,bailey,knight,iceman,tigers,purple,andrea,horny,dakota,aaaaaa,player,sunshine,morgan,starwars,boomer,cowboys,edward,charles,girls,booboo,coffee,xxxxxx,bulldog,ncc1701,rabbit,peanut,john,johnny,gandalf,spanky,winter,brandy,compaq,carlos,tennis,james,mike,brandon,fender,anthony,blowme,ferrari,cookie,chicken,maverick,chicago,joseph,diablo,sexsex,hardcore,666666,willie,welcome,chris,panther,yamaha,justin,banana,driver,marine,angels,fishing,david,maddog,hooters,wilson,butthead,dennis,fucking,captain,bigdick,chester,smokey,xavier,steven,viking,snoopy,blue,eagles,winner,samantha,house,miller,flower,jack,firebird,butter,united,turtle,steelers,tiffany,zxcvbn,tomcat,golf,bond007,bear,tiger,doctor,gateway,gators,angel,junior,thx1138,porno,badboy,debbie,spider,melissa,booger,1212,flyers,fish,porn,matrix,teens,scooby,jason,walter,cumshot,boston,braves,yankee,lover,barney,victor,tucker,princess,mercedes,5150,doggie,zzzzzz,gunner,horney,bubba,2112,fred,johnson,xxxxx,tits,member,boobs,donald,bigdaddy,bronco,penis,voyager,rangers,birdie,trouble,white,topgun,bigtits,bitches,green,super,qazwsx,magic,lakers,rachel,slayer,scott,2222,asdf,video,london,7777,marlboro,srinivas,internet,action,carter,jasper,monster,teresa,jeremy,11111111,bill,crystal,peter,pussies,cock,beer,rocket,theman,oliver,prince,beach,amateur,7777777,muffin,redsox,star,testing,shannon,murphy,frank,hannah,dave,eagle1,11111,mother,nathan,raiders,steve,forever,angela,viper,ou812,jake,lovers,suckit,gregory,buddy,whatever,young,nicholas,lucky,helpme,jackie,monica,midnight,college,baby,cunt,brian,mark,startrek,sierra,leather,232323,4444,beavis,bigcock,happy,sophie,ladies,naughty,giants,booty,blonde,fucked,golden,0,fire,sandra,pookie,packers,einstein,dolphins,chevy,winston,warrior,sammy,slut,8675309,zxcvbnm,nipples,power,victoria,asdfgh,vagina,toyota,travis,hotdog,paris,rock,xxxx,extreme,redskins,erotic,dirty,ford,freddy,arsenal,access14,wolf,nipple,iloveyou,alex,florida,eric,legend,movie,success,rosebud,jaguar,great,cool,cooper,1313,scorpio,mountain,madison,987654,brazil,lauren,japan,naked,squirt,stars,apple,alexis,aaaa,bonnie,peaches,jasmine,kevin,matt,qwertyui,danielle,beaver,4321,4128,runner,swimming,dolphin,gordon,casper,stupid,shit,saturn,gemini,apples,august,3333,canada,blazer,cumming,hunting,kitty,rainbow,112233,arthur,cream,calvin,shaved,surfer,samson,kelly,paul,mine,king,racing,5555,eagle,hentai,newyork,little,redwings,smith,sticky,cocacola,animal,broncos,private,skippy,marvin,blondes,enjoy,girl,apollo,parker,qwert,time,sydney,women,voodoo,magnum,juice,abgrtyu,777777,dreams,maxwell,music,rush2112,russia,scorpion,rebecca,tester,mistress,phantom,billy,6666,albert";

    
    const commonPasswords = cPass.split(",");

    for (let i = 0; i < commonPasswords.length; i++) {

        if (pass.includes(commonPasswords[i]) || oPass.includes(commonPasswords[i])) {

            score -= 40; 
            rec.innerHTML += "- This password contains the extremely common string: " + commonPasswords[i] + " or a substitution of it"; 
            rec.innerHTML += '<br>';
        }
    }


    if (pass.length < 8) { score = 0 }


    if (score < 20) {

        rating = "Very Weak";
        document.getElementById("rating").style.color = "#FF0000";
    
    } else if (score >= 20 && score < 40) {
        
        rating = "Weak";
        document.getElementById("rating").style.color = "#F08080";

    } else if (score >= 40 && score < 60) {
        
        rating = "Moderate";
        document.getElementById("rating").style.color = "#FFFF00";

    } else if (score >= 60 && score < 80) {
        
        rating = "Strong";
        document.getElementById("rating").style.color = "#98FB98";

    } else if (score >= 80) {
        
        rating = "Very Strong";
        document.getElementById("rating").style.color = "#32CD32";

    }

    document.getElementById("rating").innerHTML = "Your password is: " + rating;
}
