USER=ksraj123
BRANCH=patch-1

REPO=sugarizer-server
RELPATH=./ansible/deploy-to-gcp

sudo apt-get update
sudo apt-get install -y subversion
svn export https://github.com/$USER/$REPO/branches/$BRANCH/$RELPATH

# Installing Ansible throug pip
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py --user
pip install --user ansible
rm get-pip.py