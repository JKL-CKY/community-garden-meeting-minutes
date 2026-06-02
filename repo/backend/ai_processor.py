import os
import json
from dotenv import load_dotenv
from typing import List
from openai import OpenAI

from .models import Discussion, Meeting, BudgetItem, WateringDuty

load_dotenv()


class AIProcessor:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None

    def generate_plant_diagram(self, discussions: List[Discussion]) -> str:
        all_text = "\n".join([d.content for d in discussions])
        
        prompt = f"""
        基于以下社区花园会议讨论内容，生成一个ASCII植物配置图。
        请考虑提到的植物种类、区域划分和布局建议。
        
        讨论内容：
        {all_text}
        
        请输出一个清晰的ASCII图，显示不同区域和植物分布。
        """
        
        try:
            if self.client:
                response = self.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "你是一位专业的园林设计师，擅长用ASCII图展示植物布局。"},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=500
                )
                return response.choices[0].message.content.strip()
            else:
                return self._mock_plant_diagram()
        except Exception as e:
            return self._mock_plant_diagram()

    def generate_watering_schedule(self, discussions: List[Discussion]) -> List[WateringDuty]:
        all_text = "\n".join([d.content for d in discussions])
        
        prompt = f"""
        基于以下社区花园会议讨论内容，生成浇水值日表。
        请考虑植物的浇水需求、居民参与情况和区域划分。
        
        讨论内容：
        {all_text}
        
        请以JSON格式输出，格式如下：
        [
            {{"resident": "居民姓名", "day": "周一", "zones": ["阳光区"], "plants": ["玫瑰", "薰衣草"]}}
        ]
        """
        
        try:
            if self.client:
                response = self.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "你是一位社区活动组织者，擅长协调居民值班安排。"},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=800
                )
                content = response.choices[0].message.content.strip()
                data = json.loads(content)
                return [WateringDuty(**item) for item in data]
            else:
                return self._mock_watering_schedule()
        except Exception as e:
            return self._mock_watering_schedule()

    def generate_budget(self, discussions: List[Discussion]) -> List[BudgetItem]:
        all_text = "\n".join([d.content for d in discussions])
        
        prompt = f"""
        基于以下社区花园会议讨论内容，生成详细的预算清单。
        请考虑植物采购、工具、土壤、肥料等项目。
        
        讨论内容：
        {all_text}
        
        请以JSON格式输出，格式如下：
        [
            {{"item": "项目名称", "quantity": 10, "unit_price": 25.5, "total_price": 255.0}}
        ]
        """
        
        try:
            if self.client:
                response = self.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "你是一位专业的预算规划师，擅长制定详细的项目预算。"},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=800
                )
                content = response.choices[0].message.content.strip()
                data = json.loads(content)
                return [BudgetItem(**item) for item in data]
            else:
                return self._mock_budget()
        except Exception as e:
            return self._mock_budget()

    def generate_summary(self, meeting: Meeting, discussions: List[Discussion]) -> str:
        all_text = "\n".join([f"[{d.speaker_type}] {d.speaker}: {d.content}" for d in discussions])
        
        prompt = f"""
        请为以下社区花园共建会议生成一份简明摘要。
        
        会议标题：{meeting.title}
        会议日期：{meeting.date}
        会议地点：{meeting.location}
        
        讨论内容：
        {all_text}
        
        请总结会议要点、达成的共识、待办事项和下一步计划。
        """
        
        try:
            if self.client:
                response = self.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "你是一位专业的会议纪要撰写者，擅长提炼要点并生成清晰的摘要。"},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=600
                )
                return response.choices[0].message.content.strip()
            else:
                return self._mock_summary(meeting)
        except Exception as e:
            return self._mock_summary(meeting)

    def _mock_plant_diagram(self) -> str:
        return """
        社区花园植物配置图
        ==================
        
        ┌─────────────────────────────────────┐
        │              入口通道               │
        │     [石板路]  ───────────►         │
        └──────────┬──────────────────────────┘
                   │
        ┌──────────▼─────────┬──────────────────────────┐
        │                    │                          │
        │     🌞 阳光区      │      🌿 半阴区           │
        │   面积: 25.5㎡     │    面积: 18.0㎡          │
        │                    │                          │
        │  🌹 玫瑰 x 20      │  🪴 绿萝 x 15            │
        │  💜 薰衣草 x 30    │  🪴 龟背竹 x 8           │
        │  🌿 迷迭香 x 15    │  🌿 蕨类 x 20            │
        │                    │                          │
        └────────────────────┴──────────┬───────────────┘
                                        │
        ┌────────────────────────────────▼──────────────┐
        │                                                │
        │           🥬 蔬菜区 (30.0㎡)                   │
        │                                                │
        │   🍅 番茄 x 25   🥒 黄瓜 x 20   🥬 生菜 x 40  │
        │                                                │
        │               [堆肥区]  [工具棚]               │
        └────────────────────────────────────────────────┘
        """

    def _mock_watering_schedule(self) -> List[WateringDuty]:
        return [
            WateringDuty(resident="张阿姨", day="周一", zones=["阳光区"], plants=["玫瑰", "薰衣草", "迷迭香"]),
            WateringDuty(resident="李叔叔", day="周二", zones=["半阴区"], plants=["绿萝", "龟背竹", "蕨类"]),
            WateringDuty(resident="王大姐", day="周三", zones=["蔬菜区"], plants=["番茄", "黄瓜", "生菜"]),
            WateringDuty(resident="赵伯伯", day="周四", zones=["阳光区"], plants=["玫瑰", "薰衣草", "迷迭香"]),
            WateringDuty(resident="陈阿姨", day="周五", zones=["半阴区", "蔬菜区"], plants=["绿萝", "番茄", "生菜"]),
            WateringDuty(resident="刘叔叔", day="周六", zones=["阳光区", "蔬菜区"], plants=["薰衣草", "黄瓜"]),
            WateringDuty(resident="周大姐", day="周日", zones=["全区域巡检"], plants=["所有植物"])
        ]

    def _mock_budget(self) -> List[BudgetItem]:
        return [
            BudgetItem(item="玫瑰苗", quantity=20, unit_price=15.0, total_price=300.0),
            BudgetItem(item="薰衣草苗", quantity=30, unit_price=8.0, total_price=240.0),
            BudgetItem(item="迷迭香苗", quantity=15, unit_price=12.0, total_price=180.0),
            BudgetItem(item="绿萝盆栽", quantity=15, unit_price=25.0, total_price=375.0),
            BudgetItem(item="龟背竹", quantity=8, unit_price=80.0, total_price=640.0),
            BudgetItem(item="蕨类植物", quantity=20, unit_price=18.0, total_price=360.0),
            BudgetItem(item="番茄苗", quantity=25, unit_price=5.0, total_price=125.0),
            BudgetItem(item="黄瓜苗", quantity=20, unit_price=4.0, total_price=80.0),
            BudgetItem(item="生菜种子", quantity=40, unit_price=2.0, total_price=80.0),
            BudgetItem(item="有机土壤", quantity=50, unit_price=30.0, total_price=1500.0),
            BudgetItem(item="有机肥料", quantity=20, unit_price=45.0, total_price=900.0),
            BudgetItem(item="园艺工具套装", quantity=5, unit_price=120.0, total_price=600.0),
            BudgetItem(item="浇水壶", quantity=10, unit_price=35.0, total_price=350.0),
            BudgetItem(item="防护手套", quantity=20, unit_price=15.0, total_price=300.0)
        ]

    def _mock_summary(self, meeting: Meeting) -> str:
        return f"""
        本次{meeting.title}于{meeting.date}在{meeting.location}顺利召开。
        
        会议要点：
        1. 确定了社区花园三个主要种植区域：阳光区、半阴区和蔬菜区
        2. 初步选定了各区域的植物种类，包括观赏植物、观叶植物和蔬菜
        3. 讨论了居民参与机制，建立了浇水值日表
        4. 初步预算约为6000元，主要用于植物采购和基础设施
        
        达成共识：
        - 采用有机种植方式，避免使用化学农药
        - 实行轮值制度，确保花园得到持续照料
        - 设立社区花园管理小组，负责日常协调
        
        待办事项：
        - 一周内完成最终的植物清单确认
        - 两周内完成土壤检测和改良
        - 月底前完成第一批植物种植
        
        下一步计划：
        将于下周六举行第二次工作会议，讨论具体的种植时间表和分工安排。
        """
