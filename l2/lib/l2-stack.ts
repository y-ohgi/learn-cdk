import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class L2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'L2Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    const vpc = new ec2.Vpc(this, 'VPC');

    const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        edition: ec2.AmazonLinuxEdition.STANDARD,
        virtualization: ec2.AmazonLinuxVirt.HVM,
        storage: ec2.AmazonLinuxStorage.GENERAL_PURPOSE,
      }),
      maxCapacity: 3, // 最大インスタンス数
      healthChecks: autoscaling.HealthChecks.ec2({
        gracePeriod: cdk.Duration.minutes(5), // インスタンス起動後のヘルスチェック猶予時間
      }),
    });

    asg.scaleOnCpuUtilization('CpuUtilization', {
      targetUtilizationPercent: 50, // CPU使用率50%を目安にスケールイン/スケールアウト
      cooldown: cdk.Duration.minutes(5), // スケールイン/スケールアウトのクールダウン時間
    });
  }
}
