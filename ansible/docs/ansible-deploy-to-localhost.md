**Step 1** - Clone the sugarizer-server repository
    git clone --single-branch --branch genericAnsible https://github.com/ksraj123/sugarizer-server.git

**Step 2** - Execute `get-dependencies` script to install dependencies
    sudo sh ansible/deploy-to-localhost/get-dependencies.sh

**Step 3** - Execute the playbook, provide the password of your user account, omit `-e` flag if there is no password
    ansible-playbook ansible/deploy-to-localhost/install.yml -e "ansible_become_pass=<Password here>"

Sugarizer server will be accessible at localhost:8080 or 127.0.0.1:8080