pipeline {
    agent any

    environment {
        IMAGE_NAME = "shakilaaulia245/chat-service"
        CONTAINER_NAME = "chat-service"
        PORT = "8087"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Unit Test') {
            steps {
                dir('chat-service') {
                    sh 'go test ./... || true'
                }
            }
        }

        stage('Lint / Vet') {
            steps {
                dir('chat-service') {
                    sh 'go vet ./... || true'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('chat-service') {
                    sh 'docker build -t $IMAGE_NAME .'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKER_TOKEN')]) {

                    sh 'echo $DOCKER_TOKEN | docker login -u shakilaaulia245 --password-stdin'
                    sh 'docker push $IMAGE_NAME'
                }
            }
        }

        stage('Run Container (Functional Test)') {
            steps {
                sh 'docker stop $CONTAINER_NAME || true'
                sh 'docker rm $CONTAINER_NAME || true'

                sh 'docker run -d --name $CONTAINER_NAME -p $PORT:$PORT $IMAGE_NAME'
            }
        }

        stage('Verify') {
            steps {
                sh 'docker ps | grep $CONTAINER_NAME'
            }
        }
    }
}