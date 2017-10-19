if ! [[ "$#" == "3" ]] ; then echo "You should provide user, password and URL" ; exit 0 ; fi
newuser=$1
newpassword=$2
newobject="user=%7B%22name%22%3A%22${newuser}%22%2C%22role%22%3A%22admin%22%2C%22password%22%3A%22${newpassword}%22%2C%22language%22%3A%22en%22%7D"
curl -i -H "Content-Type: application/x-www-form-urlencoded" -X POST -d "${newobject}" $3

