def vars = {}

node {
	stage('Preparation') {
	    checkout scm

	    vars.DATE = sh( script: 'date +%Y-%m-%d-%H%M', returnStdout: true ).trim()
	    vars.BRANCH_NAME = env.BRANCH_NAME
	    vars.GIT_REVISION = sh( script: 'git rev-parse --short HEAD', returnStdout: true ).trim()

		echo "===> Changeset from ${vars.BRANCH_NAME} commit ${vars.GIT_REVISION} on ${vars.DATE}"
	}

	stage('Build') {
		try {
			sh """
				npm install
				npm run build
				docker build -t treegateway .
				find . -type f
			"""
		} finally {
			sh """
			"""
		}
	}

	withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: 'aws-jenkins-automation', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {

		stage('Publish') {
				sh """
					mkdir -p $HOME/.aws
					echo "[default]" > $HOME/.aws/config
					echo "aws_access_key_id=$AWS_ACCESS_KEY_ID" >> $HOME/.aws/config
					echo "aws_secret_access_key=$AWS_SECRET_ACCESS_KEY" >> $HOME/.aws/config
					echo "region=us-west-2" >> $HOME/.aws/config
					echo "output=json" >> $HOME/.aws/config

					\$(aws ecr get-login --region us-west-2 | sed -e 's/-e none//g')

					docker tag treegateway:latest 297650904467.dkr.ecr.us-west-2.amazonaws.com/treegateway:latest
					docker push 297650904467.dkr.ecr.us-west-2.amazonaws.com/treegateway:latest
		"""
		}
	}
}
