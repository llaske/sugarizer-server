# Deploy Sugarizer Server on AWS

To deploy sugarizer on Amazon Web Services, we will be creating a custom Sugarizer AMI ([Amazon Machine Image](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html)) using packer tool. Then we can create a Sugarizer server using that custom image. Make sure you have a AWS account already.

*Note:* If you are planning to setup Packer on the local workstation, make sure you have the AWS access keys set on file ```~/.aws/credentials```. It is not mandatory to have credentials file. You can pass the AWS credentials using the packer variable declaration(not preferred for security).

## Installing Packer

*Step 1:* Download the required package from [here](https://www.packer.io/downloads.html). 

*Step 2:* Unzip the package and set the path variable.

```export PATH=$PATH:/path/to/packer```

*Step 3:* Refresh terminal.
```source ~/.bashrc``` 

*Step 4:* Verify packer installation by executing the packer command.
```packer version```

## Building an AMI image

*Step 1:* Clone the DeploySugarizerGCP repository.
``` git clone https://github.com/amanharitsh123/DeploySugarizerGCP.git ```

*Step 2:* Change into the directory and run packer template.
```cd DeploySugarizerGCP
   packer build template.json
```
Now you can find your own custom image on AWS Images>AMIs section.

## Deploying the Sugarizer Image

AWS has some really good documentation for this part. Please follow the steps [here](https://aws.amazon.com/premiumsupport/knowledge-center/launch-instance-custom-ami/).





