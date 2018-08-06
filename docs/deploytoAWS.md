# Deploy Sugarizer Server on AWS

To deploy sugarizer on aws , we will be creating a custom sugarizer ami first using packer. Then we can create a sugarizer server using that custom ami. Make sure you have a AWS account already.

*Note:* If you are planning to setup Packer on the local workstation, make sure you have the aws access keys set on file ```~/.aws/credentials```. It is not mandatory to have credentials file. You can pass the AWS credentials using the packer variable declaration(not preferred for security).

## Installing Packer:

*Step 1:* Download the required package from here. https://www.packer.io/downloads.html

*Step 2:* Unzip the package and set the path variable.

```export PATH=$PATH:/path/to/packer```

*Step 3:* Refresh terminal.
```source ~/.bashrc``` 

*Step 4:* Verify packer installation by executing the packer command.
```packer version```

## Building an image:

*Step 1:* Clone the DeploySugarizerGCP repository.
``` git clone https://github.com/amanharitsh123/DeploySugarizerGCP.git ```

*Step 2:* Change into the directory and run packer template.
```cd DeploySugarizerGCP
   packer build template.json
```
Now you can find your own custom image on AWS Images>AMIs section.

## Deploying the Sugarizer Image

AWS has some really good documentation for this part. Please follow the steps here:

https://aws.amazon.com/premiumsupport/knowledge-center/launch-instance-custom-ami/



